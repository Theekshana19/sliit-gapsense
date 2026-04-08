using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GapSense.Infrastructure.Persistence;
using GapSense.Domain.Entities;
using GapSense.Application.DTOs.Common;
using GapSense.Application.DTOs.Readiness;

namespace GapSense.API.Controllers;

// handles student quiz submissions - auto-calculates scores
// base route: /api/submissions
[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SubmissionsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public SubmissionsController(ApplicationDbContext db)
    {
        _db = db;
    }

    // GET /api/submissions - get all submissions, optionally filtered by quiz
    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<List<SubmissionDto>>>> GetSubmissions(
        [FromQuery] Guid? quizId)
    {
        var query = _db.Submissions
            .Include(s => s.Quiz)
                .ThenInclude(q => q.Module)
            .Include(s => s.Answers)
            .AsQueryable();

        if (quizId.HasValue)
            query = query.Where(s => s.QuizId == quizId.Value);

        var submissions = await query
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => MapToDto(s))
            .ToListAsync();

        return Ok(ApiResponseDto<List<SubmissionDto>>.SuccessResponse(submissions));
    }

    // GET /api/submissions/stats - get submission statistics
    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponseDto<SubmissionStatsDto>>> GetStats(
        [FromQuery] Guid? quizId)
    {
        var query = _db.Submissions.AsQueryable();
        if (quizId.HasValue)
            query = query.Where(s => s.QuizId == quizId.Value);

        var submissions = await query.ToListAsync();
        var total = submissions.Count;

        var stats = new SubmissionStatsDto
        {
            TotalEnrollments = total,
            TotalCompletionRate = total > 0
                ? (int)(submissions.Count(s => s.Status == "Submitted" || s.Status == "Graded") * 100.0 / total)
                : 0,
            InProgressCount = submissions.Count(s => s.Status == "In Progress"),
            PendingReminders = submissions.Count(s => s.Status == "Not Attempted"),
        };

        return Ok(ApiResponseDto<SubmissionStatsDto>.SuccessResponse(stats));
    }

    // GET /api/submissions/history — students see only their attempts (match profile StudentId); staff see all
    [HttpGet("history")]
    public async Task<ActionResult<ApiResponseDto<List<AttemptSummaryDto>>>> GetHistory()
    {
        var query = _db.Submissions
            .Include(s => s.Quiz)
                .ThenInclude(q => q.Module)
            .Where(s => s.Status == "Submitted" || s.Status == "Graded")
            .AsQueryable();

        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        if (string.Equals(role, "student", StringComparison.OrdinalIgnoreCase))
        {
            var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(idValue, out var userId))
                return Ok(ApiResponseDto<List<AttemptSummaryDto>>.SuccessResponse(new List<AttemptSummaryDto>()));

            var user = await _db.Users
                .AsNoTracking()
                .Include(u => u.StudentProfile)
                .FirstOrDefaultAsync(u => u.Id == userId);

            var regId = user?.StudentProfile?.StudentId;
            if (string.IsNullOrWhiteSpace(regId))
                return Ok(ApiResponseDto<List<AttemptSummaryDto>>.SuccessResponse(new List<AttemptSummaryDto>()));

            query = query.Where(s => s.StudentId == regId);
        }

        var attempts = await query
            .OrderByDescending(s => s.SubmittedAt)
            .Select(s => new AttemptSummaryDto
            {
                Id = s.Id,
                QuizId = s.QuizId.ToString(),
                QuizTitle = s.Quiz.Title,
                QuizRef = $"QZ-{s.Quiz.Module.ModuleCode}-{s.AttemptNumber:D2}",
                ModuleCode = s.Quiz.Module.ModuleCode,
                AttemptNumber = s.AttemptNumber,
                Score = s.Score,
                TotalMarks = s.TotalMarks,
                Percentage = s.Percentage,
                SubmittedAt = s.SubmittedAt.HasValue ? s.SubmittedAt.Value.ToString("yyyy-MM-dd") : "",
                TimeTakenMinutes = s.TimeTakenMinutes,
                Status = s.Status == "Submitted" ? "Graded" : s.Status,
            })
            .ToListAsync();

        return Ok(ApiResponseDto<List<AttemptSummaryDto>>.SuccessResponse(attempts));
    }

    // GET /api/submissions/history/stats — scoped to the current student when role is student
    [HttpGet("history/stats")]
    public async Task<ActionResult<ApiResponseDto<AttemptStatsDto>>> GetHistoryStats()
    {
        var query = _db.Submissions
            .Where(s => s.Status == "Submitted" || s.Status == "Graded")
            .AsQueryable();

        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        if (string.Equals(role, "student", StringComparison.OrdinalIgnoreCase))
        {
            var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(idValue, out var userId))
            {
                return Ok(ApiResponseDto<AttemptStatsDto>.SuccessResponse(new AttemptStatsDto
                {
                    TotalAttempts = 0,
                    AvgSuccessRate = 0,
                    FlaggedAttempts = 0,
                    ChangePercentage = 0,
                }));
            }

            var user = await _db.Users
                .AsNoTracking()
                .Include(u => u.StudentProfile)
                .FirstOrDefaultAsync(u => u.Id == userId);

            var regId = user?.StudentProfile?.StudentId;
            if (string.IsNullOrWhiteSpace(regId))
            {
                return Ok(ApiResponseDto<AttemptStatsDto>.SuccessResponse(new AttemptStatsDto
                {
                    TotalAttempts = 0,
                    AvgSuccessRate = 0,
                    FlaggedAttempts = 0,
                    ChangePercentage = 0,
                }));
            }

            query = query.Where(s => s.StudentId == regId);
        }

        var attempts = await query.ToListAsync();

        var stats = new AttemptStatsDto
        {
            TotalAttempts = attempts.Count,
            AvgSuccessRate = attempts.Count > 0
                ? Math.Round(attempts.Average(a => a.Percentage), 1)
                : 0,
            FlaggedAttempts = attempts.Count(a => a.Percentage < 40), // below passing threshold
            ChangePercentage = 0, // would compare with previous period
        };

        return Ok(ApiResponseDto<AttemptStatsDto>.SuccessResponse(stats));
    }

    // GET /api/submissions/{id} - get a single submission with full details
    // shows the question text, all options, what student picked, and correct answer
    // students can only view their own submissions; lecturers/admins can view any
    // NOTE: this route must come AFTER /stats and /history to avoid conflict
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponseDto<SubmissionDetailDto>>> GetSubmissionDetail(Guid id)
    {
        // load the submission with everything we need for the detail view
        var submission = await _db.Submissions
            .Include(s => s.Quiz)
                .ThenInclude(q => q.Module)
            .Include(s => s.Quiz)
                .ThenInclude(q => q.QuizQuestions)
                    .ThenInclude(qq => qq.Question)
                        .ThenInclude(q => q.Options)
            .Include(s => s.Answers)
                .ThenInclude(a => a.Question)
                    .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (submission == null)
            return NotFound(ApiResponseDto<SubmissionDetailDto>.ErrorResponse("Submission not found"));

        // if the user is a student, they can only see their own submissions
        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        if (string.Equals(role, "student", StringComparison.OrdinalIgnoreCase))
        {
            var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(idValue, out var userId))
            {
                var user = await _db.Users
                    .Include(u => u.StudentProfile)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user?.StudentProfile?.StudentId != submission.StudentId)
                    return Forbid();
            }
            else
            {
                return Unauthorized();
            }
        }

        // build the detailed answers list
        var answerDetails = submission.Answers.Select(a =>
        {
            var question = a.Question;
            var options = question.Options.OrderBy(o => o.SortOrder).Select(o => new SubmissionOptionDetailDto
            {
                Id = o.Id.ToString(),
                OptionText = o.OptionText,
                IsCorrect = o.IsCorrect,
                IsSelected = a.SelectedOptionId.HasValue && o.Id == a.SelectedOptionId.Value,
            }).ToList();

            return new SubmissionAnswerDetailDto
            {
                QuestionId = question.Id.ToString(),
                QuestionDisplayId = question.QuestionDisplayId,
                QuestionText = question.QuestionText,
                Difficulty = question.Difficulty,
                Marks = a.Marks,
                MarksAwarded = a.IsCorrect ? a.Marks : 0,
                IsCorrect = a.IsCorrect,
                Explanation = question.Explanation,
                Options = options,
            };
        }).ToList();

        var detail = new SubmissionDetailDto
        {
            Id = submission.Id,
            QuizId = submission.QuizId.ToString(),
            QuizTitle = submission.Quiz.Title,
            QuizRef = $"QZ-{submission.Quiz.Module.ModuleCode}-{submission.AttemptNumber:D2}",
            ModuleCode = submission.Quiz.Module.ModuleCode,
            ModuleName = submission.Quiz.Module.ModuleName,
            StudentId = submission.StudentId,
            StudentName = submission.StudentName,
            StudentAvatar = submission.StudentAvatar,
            AvatarColor = submission.AvatarColor,
            AttemptNumber = submission.AttemptNumber,
            Score = submission.Score,
            TotalMarks = submission.TotalMarks,
            Percentage = submission.Percentage,
            Status = submission.Status,
            IsPassed = submission.Percentage >= submission.Quiz.PassingPercentage,
            PassingPercentage = submission.Quiz.PassingPercentage,
            StartedAt = submission.StartedAt.ToString("yyyy-MM-ddTHH:mm:ss"),
            SubmittedAt = submission.SubmittedAt?.ToString("yyyy-MM-ddTHH:mm:ss") ?? "",
            TimeTakenMinutes = submission.TimeTakenMinutes,
            Answers = answerDetails,
        };

        return Ok(ApiResponseDto<SubmissionDetailDto>.SuccessResponse(detail));
    }

    // POST /api/submissions - submit a quiz (auto-calculates score)
    // students can only submit as themselves - prevents impersonation
    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<SubmissionDto>>> SubmitQuiz(CreateSubmissionDto dto)
    {
        // if the user is a student, force the submission to use their own student id
        // this prevents one student from submitting a quiz as another student
        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        if (string.Equals(role, "student", StringComparison.OrdinalIgnoreCase))
        {
            var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(idValue, out var userId))
                return Unauthorized(ApiResponseDto<SubmissionDto>.ErrorResponse("Invalid user token"));

            // load the student profile to get their real student id
            var user = await _db.Users
                .Include(u => u.StudentProfile)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.StudentProfile?.StudentId == null)
                return BadRequest(ApiResponseDto<SubmissionDto>.ErrorResponse(
                    "Your account is missing a Student ID. Update your profile first."));

            // override whatever the client sent with the real authenticated student info
            dto.StudentId = user.StudentProfile.StudentId;
            dto.StudentName = user.FullName;
        }

        // get the quiz with its questions and correct answers
        var quiz = await _db.Quizzes
            .Include(q => q.Module)
            .Include(q => q.QuizQuestions)
                .ThenInclude(qq => qq.Question)
                    .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == dto.QuizId);

        if (quiz == null)
            return BadRequest(ApiResponseDto<SubmissionDto>.ErrorResponse("Quiz not found"));

        // check attempt limit
        var previousAttempts = await _db.Submissions
            .CountAsync(s => s.QuizId == dto.QuizId && s.StudentId == dto.StudentId
                && (s.Status == "Submitted" || s.Status == "Graded"));

        if (previousAttempts >= quiz.MaxAttempts)
            return BadRequest(ApiResponseDto<SubmissionDto>.ErrorResponse(
                $"You have reached the maximum number of attempts ({quiz.MaxAttempts})."));

        // create submission
        var submission = new Submission
        {
            QuizId = dto.QuizId,
            StudentId = dto.StudentId,
            StudentName = dto.StudentName,
            StudentAvatar = dto.StudentAvatar,
            AvatarColor = dto.AvatarColor,
            AttemptNumber = previousAttempts + 1,
            TotalMarks = quiz.TotalMarks,
            Status = "Submitted",
            SubmittedAt = DateTime.UtcNow,
        };

        // auto-calculate score by checking each answer
        int totalScore = 0;
        foreach (var answer in dto.Answers)
        {
            // find the quiz question to get the marks
            var quizQuestion = quiz.QuizQuestions.FirstOrDefault(qq => qq.QuestionId == answer.QuestionId);
            if (quizQuestion == null) continue;

            // check if the selected option is correct
            var isCorrect = false;
            var marksAwarded = 0;

            if (answer.SelectedOptionId.HasValue)
            {
                var correctOption = quizQuestion.Question.Options.FirstOrDefault(o => o.IsCorrect);
                isCorrect = correctOption != null && correctOption.Id == answer.SelectedOptionId.Value;
                marksAwarded = isCorrect ? quizQuestion.Marks : 0;
            }

            totalScore += marksAwarded;

            submission.Answers.Add(new SubmissionAnswer
            {
                QuestionId = answer.QuestionId,
                SelectedOptionId = answer.SelectedOptionId,
                IsCorrect = isCorrect,
                Marks = marksAwarded,
            });
        }

        // set the calculated score
        submission.Score = totalScore;
        submission.Percentage = quiz.TotalMarks > 0
            ? Math.Round((decimal)totalScore / quiz.TotalMarks * 100, 2)
            : 0;

        // calculate time taken
        submission.TimeTakenMinutes = (int)(DateTime.UtcNow - submission.StartedAt).TotalMinutes;

        _db.Submissions.Add(submission);
        await _db.SaveChangesAsync();

        // reload for response
        var created = await _db.Submissions
            .Include(s => s.Quiz)
                .ThenInclude(q => q.Module)
            .Include(s => s.Answers)
            .FirstAsync(s => s.Id == submission.Id);

        return CreatedAtAction(nameof(GetSubmissions), null,
            ApiResponseDto<SubmissionDto>.SuccessResponse(MapToDto(created), "Quiz submitted successfully"));
    }

    // helper to map submission entity to DTO
    private static SubmissionDto MapToDto(Submission s)
    {
        return new SubmissionDto
        {
            Id = s.Id,
            QuizId = s.QuizId.ToString(),
            QuizTitle = s.Quiz.Title,
            QuizRef = $"QZ-{s.Quiz.Module.ModuleCode}-{s.AttemptNumber:D2}",
            StudentId = s.StudentId,
            StudentName = s.StudentName,
            StudentAvatar = s.StudentAvatar,
            AvatarColor = s.AvatarColor,
            ModuleCode = s.Quiz.Module.ModuleCode,
            AttemptNumber = s.AttemptNumber,
            Answers = s.Answers.Select(a => new SubmissionAnswerDto
            {
                QuestionId = a.QuestionId.ToString(),
                SelectedOptionId = a.SelectedOptionId?.ToString() ?? "",
                IsCorrect = a.IsCorrect,
                Marks = a.Marks,
            }).ToList(),
            Score = s.Score,
            TotalMarks = s.TotalMarks,
            Percentage = s.Percentage,
            Status = s.Status,
            StartedAt = s.StartedAt.ToString("yyyy-MM-ddTHH:mm:ss"),
            SubmittedAt = s.SubmittedAt?.ToString("yyyy-MM-ddTHH:mm:ss") ?? "",
            TimeTakenMinutes = s.TimeTakenMinutes,
        };
    }
}
