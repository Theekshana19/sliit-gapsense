namespace GapSense.Application.DTOs;

public record QuizAttemptResponse
{
    public required Guid Id { get; init; }
    public required Guid QuizId { get; init; }
    public required string QuizTitle { get; init; }
    public required Guid UserId { get; init; }
    public required int TotalScorePercent { get; init; }
    public required IReadOnlyList<QuizTopicScoreDto> TopicScores { get; init; }
    public required DateTime SubmittedAtUtc { get; init; }
    public required int AttemptNumber { get; init; }
}
