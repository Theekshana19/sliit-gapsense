namespace GapSense.Domain.Entities;

public class QuizAttempt
{
    public Guid Id { get; set; }

    public Guid QuizId { get; set; }

    public Quiz Quiz { get; set; } = null!;

    public Guid UserId { get; set; }

    public int TotalScorePercent { get; set; }

    /// <summary>JSON array: [{"topicName":"...","percent":28}, ...]</summary>
    public string TopicScoresJson { get; set; } = "[]";

    public DateTime SubmittedAtUtc { get; set; }

    public int AttemptNumber { get; set; }
}
