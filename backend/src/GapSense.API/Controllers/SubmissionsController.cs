using System.Security.Claims;
using System.Text.Json;
using GapSense.API.Models;
using GapSense.Application.DTOs.Readiness;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GapSense.API.Controllers;

// Handles student quiz submissions and mirrors results into QuizAttempts (topic score JSON).
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubmissionsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    // Keep the JSON shape stable for StudentAnalyticsService parsing.
    private static readonly JsonSerializerOptions TopicJsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public SubmissionsController(ApplicationDbContext db)
    {
        _db = db;
    }

    // GET /api/submissions?quizId=<guid>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SubmissionDto>>>> GetSubmissions(
        [FromQuery] Guid? quizId,
        CancellationToken cancellationToken)
    {
        var query = _db.Submissions
            .Include(s => s.Quiz)
                .ThenInclude(q => q.Module)
            .Include(s => s.Answers)
            .AsQueryable();

        if (quizId.HasValue)
            query = query.Where(s => s.QuizId == quizId.Value);

        var rows = await query
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => MapToDto(s))
            .ToListAsync(cancellationToken);

        return Ok(ApiResponse<IReadOnlyList<SubmissionDto>>.Ok(rows));
    }

    // GET /api/submissions/stats?quizId=<guid>
    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponse<SubmissionStatsDto>>> GetStats(
        [FromQuery] Guid? quizId,
        CancellationToken cancellationToken)
    {
        var query = _db.Submissions.AsQueryable();
        if (quizId.HasValue)
            query = query.Where(s => s.QuizId == quizId.Value);

        var rows = await query.ToListAsync(cancellationToken);

        var stats = new SubmissionStatsDto
        {
            TotalEnrollments = rows.Count,
            TotalCompletionRate = rows.Count(s => s.Status == "Submitted" || s.Status == "Graded") * 100 / Math.Max(1, rows.Count),
            InProgressCount = rows.Count(s => s.Status == "In Progress"),
            PendingReminders = rows.Count(s => s.Status == "Not Attempted"),
        };

        return Ok(ApiResponse<SubmissionStatsDto>.Ok(stats));
    }

    // GET /api/submissions/history
    [HttpGet("history")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AttemptSummaryDto>>>> GetHistory(
        CancellationToken cancellationToken)
    {
        var rows = await _db.Submissions
            .Include(s => s.Quiz)
                .ThenInclude(q => q.Module)
            .Where(s => s.Status == "Submitted" || s.Status == "Graded")
            .OrderByDescending(s => s.SubmittedAt)
            .Select(s => new AttemptSummaryDto
            {
                Id = s.Id,
                QuizId = s.QuizId.ToString(),
                QuizTitle = s.Quiz.Title,
                QuizRef = $"QZ-{(s.Quiz.Module != null ? s.Quiz.Module.ModuleCode : s.Quiz.ModuleCode)}-{s.AttemptNumber:D2}",
                ModuleCode = s.Quiz.Module != null ? s.Quiz.Module.ModuleCode : s.Quiz.ModuleCode,
                AttemptNumber = s.AttemptNumber,
                Score = s.Score,
                TotalMarks = s.TotalMarks,
                Percentage = s.Percentage,
                SubmittedAt = s.SubmittedAt.HasValue ? s.SubmittedAt.Value.ToString("yyyy-MM-dd") : "",
                TimeTakenMinutes = s.TimeTakenMinutes,
                Status = s.Status == "Submitted" ? "Graded" : s.Status
            })
            .ToListAsync(cancellationToken);

        return Ok(ApiResponse<IReadOnlyList<AttemptSummaryDto>>.Ok(rows));
    }

    // GET /api/submissions/history/stats
    [HttpGet("history/stats")]
    public async Task<ActionResult<ApiResponse<AttemptStatsDto>>> GetHistoryStats(
        CancellationToken cancellationToken)
    {
        var attempts = await _db.Submissions
            .Where(s => s.Status == "Submitted" || s.Status == "Graded")
            .ToListAsync(cancellationToken);

        var stats = new AttemptStatsDto
        {
            TotalAttempts = attempts.Count,
            AvgSuccessRate = attempts.Count > 0
                ? Math.Round(attempts.Average(a => a.Percentage), 1)
                : 0,
            FlaggedAttempts = attempts.Count(a => a.Percentage < 40), // below passing threshold
            ChangePercentage = 0 // would compare with previous period
        };

        return Ok(ApiResponse<AttemptStatsDto>.Ok(stats));
    }

    // POST /api/submissions
    [HttpPost]
    public async Task<ActionResult<ApiResponse<SubmissionDto>>> SubmitQuiz(
        [FromBody] CreateSubmissionDto dto,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(ApiResponse<SubmissionDto>.Fail("Invalid user."));

        // Load quiz with its question bank (marks, topics, and options).
        var quiz = await _db.Quizzes
            .Include(q => q.Module)
            .Include(q => q.QuizQuestions)
                .ThenInclude(qq => qq.Question)
                    .ThenInclude(q => q.Topic)
            .Include(q => q.QuizQuestions)
                .ThenInclude(qq => qq.Question)
                    .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == dto.QuizId, cancellationToken);

        if (quiz is null)
            return BadRequest(ApiResponse<SubmissionDto>.Fail("Quiz not found"));

        var maxAttempts = quiz.MaxAttempts <= 0 ? 1 : quiz.MaxAttempts;

        var previousAttempts = await _db.Submissions
            .CountAsync(s =>
                    s.QuizId == dto.QuizId &&
                    s.StudentId == dto.StudentId &&
                    (s.Status == "Submitted" || s.Status == "Graded"),
                cancellationToken);

        if (previousAttempts >= maxAttempts)
            return BadRequest(ApiResponse<SubmissionDto>.Fail($"You have reached the maximum number of attempts ({maxAttempts})."));

        // Create submission
        var attemptNumber = previousAttempts + 1;

        var quizPossibleTotal = quiz.TotalMarks > 0
            ? quiz.TotalMarks
            : quiz.QuizQuestions.Sum(qq => qq.Marks);

        var submission = new Submission
        {
            QuizId = dto.QuizId,
            StudentId = dto.StudentId,
            StudentName = dto.StudentName,
            StudentAvatar = dto.StudentAvatar,
            AvatarColor = dto.AvatarColor,
            AttemptNumber = attemptNumber,
            TotalMarks = quizPossibleTotal,
            Status = "Submitted",
            SubmittedAt = DateTime.UtcNow,
        };

        // Calculate score + per-topic tallies
        var totals = new Dictionary<string, (int earned, int possible)>(StringComparer.OrdinalIgnoreCase);
        var qqByQuestionId = quiz.QuizQuestions.ToDictionary(qq => qq.QuestionId, qq => qq);

        int totalScore = 0;

        foreach (var answer in dto.Answers)
        {
            if (!qqByQuestionId.TryGetValue(answer.QuestionId, out var quizQuestion))
                continue;

            var question = quizQuestion.Question;
            var topicName = question.Topic?.TopicName;
            if (string.IsNullOrWhiteSpace(topicName))
                topicName = "General";

            if (!totals.TryGetValue(topicName, out var t))
                t = (0, 0);

            var isCorrect = false;
            var marksAwarded = 0;

            if (answer.SelectedOptionId.HasValue)
            {
                var correctOption = question.Options.FirstOrDefault(o => o.IsCorrect);
                isCorrect = correctOption != null && correctOption.Id == answer.SelectedOptionId.Value;
                marksAwarded = isCorrect ? quizQuestion.Marks : 0;
            }

            t.possible += quizQuestion.Marks;
            t.earned += marksAwarded;
            totals[topicName] = t;
            totalScore += marksAwarded;

            submission.Answers.Add(new SubmissionAnswer
            {
                QuestionId = answer.QuestionId,
                SelectedOptionId = answer.SelectedOptionId,
                IsCorrect = isCorrect,
                Marks = marksAwarded
            });
        }

        submission.Score = totalScore;
        submission.Percentage = quizPossibleTotal > 0
            ? Math.Round((decimal)totalScore / quizPossibleTotal * 100, 2)
            : 0;
        submission.TimeTakenMinutes = (int)(DateTime.UtcNow - submission.StartedAt).TotalMinutes;

        _db.Submissions.Add(submission);
        await _db.SaveChangesAsync(cancellationToken);

        // Mirror into QuizAttempts for Student Analytics.
        await UpsertQuizAttemptAsync(userId, submission, totals, cancellationToken);

        // Reload for DTO
        var created = await _db.Submissions
            .Include(s => s.Quiz)
                .ThenInclude(q => q.Module)
            .Include(s => s.Answers)
            .FirstAsync(s => s.Id == submission.Id, cancellationToken);

        return Ok(ApiResponse<SubmissionDto>.Ok(MapToDto(created), "Quiz submitted successfully"));
    }

    private async Task UpsertQuizAttemptAsync(
        Guid userId,
        Submission submission,
        Dictionary<string, (int earned, int possible)> totals,
        CancellationToken cancellationToken)
    {
        var topicRows = totals.Select(kvp =>
            new
            {
                topicName = kvp.Key,
                percent = kvp.Value.possible > 0
                    ? (int)Math.Clamp(Math.Round(kvp.Value.earned * 100.0 / kvp.Value.possible), 0, 100)
                    : 0
            }).ToList();

        var json = JsonSerializer.Serialize(topicRows, TopicJsonOptions);

        var totalPercent = (int)Math.Clamp(Math.Round((decimal)submission.Percentage), 0, 100);

        var existing = await _db.QuizAttempts.FirstOrDefaultAsync(a =>
                a.QuizId == submission.QuizId &&
                a.UserId == userId &&
                a.AttemptNumber == submission.AttemptNumber,
            cancellationToken);

        if (existing is null)
        {
            existing = new QuizAttempt
            {
                Id = Guid.NewGuid(),
                QuizId = submission.QuizId,
                UserId = userId,
                AttemptNumber = submission.AttemptNumber
            };
            _db.QuizAttempts.Add(existing);
        }

        existing.TotalScorePercent = totalPercent;
        existing.TopicScoresJson = json;
        existing.SubmittedAtUtc = submission.SubmittedAt!.Value;

        await _db.SaveChangesAsync(cancellationToken);
    }

    private static SubmissionDto MapToDto(Submission s) =>
        new()
        {
            Id = s.Id,
            QuizId = s.QuizId.ToString(),
            QuizTitle = s.Quiz.Title,
            QuizRef = $"QZ-{(s.Quiz.Module != null ? s.Quiz.Module.ModuleCode : s.Quiz.ModuleCode)}-{s.AttemptNumber:D2}",
            StudentId = s.StudentId,
            StudentName = s.StudentName,
            StudentAvatar = s.StudentAvatar,
            AvatarColor = s.AvatarColor,
            ModuleCode = s.Quiz.Module != null ? s.Quiz.Module.ModuleCode : s.Quiz.ModuleCode,
            AttemptNumber = s.AttemptNumber,
            Answers = s.Answers.Select(a => new SubmissionAnswerDto
            {
                QuestionId = a.QuestionId.ToString(),
                SelectedOptionId = a.SelectedOptionId?.ToString() ?? "",
                IsCorrect = a.IsCorrect,
                Marks = a.Marks
            }).ToList(),
            Score = s.Score,
            TotalMarks = s.TotalMarks,
            Percentage = s.Percentage,
            Status = s.Status,
            StartedAt = s.StartedAt.ToString("yyyy-MM-ddTHH:mm:ss"),
            SubmittedAt = s.SubmittedAt?.ToString("yyyy-MM-ddTHH:mm:ss") ?? "",
            TimeTakenMinutes = s.TimeTakenMinutes
        };

    private bool TryGetUserId(out Guid userId)
    {
        userId = default;
        var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return !string.IsNullOrWhiteSpace(idValue) && Guid.TryParse(idValue, out userId);
    }
}

