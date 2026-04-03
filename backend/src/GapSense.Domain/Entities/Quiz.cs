namespace GapSense.Domain.Entities;

public class Quiz
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string ModuleCode { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsPublished { get; set; }

    public Guid? CreatedByUserId { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public ICollection<QuizAttempt> Attempts { get; set; } = new List<QuizAttempt>();
}
