namespace GapSense.Application.DTOs;

public record QuizTopicScoreDto
{
    public required string TopicName { get; init; }
    public required int Percent { get; init; }
}

public record SubmitQuizAttemptRequest
{
    public required int TotalScorePercent { get; init; }
    public required IReadOnlyList<QuizTopicScoreDto> TopicScores { get; init; }
}
