using System.Text.Json;
using GapSense.Application.DTOs;
using GapSense.Application.Services;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Services;

public class QuizAttemptService : IQuizAttemptService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    private readonly ApplicationDbContext _context;

    public QuizAttemptService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<QuizAttemptResponse> SubmitAsync(Guid quizId, Guid userId, SubmitQuizAttemptRequest request,
        CancellationToken cancellationToken = default)
    {
        var quiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Id == quizId, cancellationToken);
        if (quiz is null)
            throw new InvalidOperationException("Quiz not found.");
        if (!quiz.IsPublished)
            throw new InvalidOperationException("Quiz is not published.");

        var score = Math.Clamp(request.TotalScorePercent, 0, 100);
        var topics = (request.TopicScores ?? Array.Empty<QuizTopicScoreDto>())
            .Where(t => !string.IsNullOrWhiteSpace(t.TopicName))
            .Select(t => new QuizTopicScoreDto
            {
                TopicName = t.TopicName.Trim(),
                Percent = Math.Clamp(t.Percent, 0, 100)
            })
            .ToList();

        var maxAttempt = await _context.QuizAttempts
            .Where(a => a.QuizId == quizId && a.UserId == userId)
            .Select(a => (int?)a.AttemptNumber)
            .MaxAsync(cancellationToken) ?? 0;

        var json = JsonSerializer.Serialize(
            topics.Select(t => new { topicName = t.TopicName, percent = t.Percent }),
            JsonOptions);

        var entity = new QuizAttempt
        {
            Id = Guid.NewGuid(),
            QuizId = quizId,
            UserId = userId,
            TotalScorePercent = score,
            TopicScoresJson = json,
            SubmittedAtUtc = DateTime.UtcNow,
            AttemptNumber = maxAttempt + 1
        };

        _context.QuizAttempts.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Map(entity, quiz.Title, topics);
    }

    public async Task<IReadOnlyList<QuizAttemptResponse>> GetForUserAsync(Guid userId,
        CancellationToken cancellationToken = default)
    {
        var rows = await _context.QuizAttempts
            .AsNoTracking()
            .Include(a => a.Quiz)
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.SubmittedAtUtc)
            .ToListAsync(cancellationToken);

        return rows.Select(a => Map(a, a.Quiz.Title, ParseTopics(a.TopicScoresJson))).ToList();
    }

    public async Task<IReadOnlyList<QuizAttemptResponse>> GetForQuizAsync(Guid quizId,
        CancellationToken cancellationToken = default)
    {
        var rows = await _context.QuizAttempts
            .AsNoTracking()
            .Include(a => a.Quiz)
            .Where(a => a.QuizId == quizId)
            .OrderBy(a => a.UserId)
            .ThenBy(a => a.AttemptNumber)
            .ToListAsync(cancellationToken);

        return rows.Select(a => Map(a, a.Quiz.Title, ParseTopics(a.TopicScoresJson))).ToList();
    }

    private static QuizAttemptResponse Map(QuizAttempt a, string quizTitle, IReadOnlyList<QuizTopicScoreDto> topics) =>
        new()
        {
            Id = a.Id,
            QuizId = a.QuizId,
            QuizTitle = quizTitle,
            UserId = a.UserId,
            TotalScorePercent = a.TotalScorePercent,
            TopicScores = topics,
            SubmittedAtUtc = a.SubmittedAtUtc,
            AttemptNumber = a.AttemptNumber
        };

    private static List<QuizTopicScoreDto> ParseTopics(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new List<QuizTopicScoreDto>();

        try
        {
            var rows = JsonSerializer.Deserialize<List<TopicRow>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            if (rows is null)
                return new List<QuizTopicScoreDto>();

            return rows
                .Where(r => !string.IsNullOrWhiteSpace(r.TopicName))
                .Select(r => new QuizTopicScoreDto
                {
                    TopicName = r.TopicName!.Trim(),
                    Percent = Math.Clamp(r.Percent, 0, 100)
                })
                .ToList();
        }
        catch (JsonException)
        {
            return new List<QuizTopicScoreDto>();
        }
    }

    private sealed class TopicRow
    {
        public string? TopicName { get; set; }
        public int Percent { get; set; }
    }
}
