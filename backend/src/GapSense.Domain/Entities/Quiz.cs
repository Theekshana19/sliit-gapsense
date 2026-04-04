namespace GapSense.Domain.Entities;

public class Quiz
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string ModuleCode { get; set; } = string.Empty;

    // Curriculum relation (Chamodi)
    public Guid? ModuleId { get; set; }
    public Module? Module { get; set; }

    public string? Description { get; set; }

    // Optional curriculum metadata (Chamodi)
    public string Intake { get; set; } = string.Empty;
    public int TotalMarks { get; set; }
    public int PassingPercentage { get; set; } = 40;
    public int TimeLimitMinutes { get; set; } = 60;
    public int MaxAttempts { get; set; } = 1;
    public bool ShuffleQuestions { get; set; } = false;
    public bool ShuffleOptions { get; set; } = false;
    public string Status { get; set; } = "Draft";

    public bool IsPublished { get; set; }

    public Guid? CreatedByUserId { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public ICollection<QuizAttempt> Attempts { get; set; } = new List<QuizAttempt>();

    public ICollection<QuizQuestion> QuizQuestions { get; set; } = new List<QuizQuestion>();

    public ICollection<QuizSchedule> Schedules { get; set; } = new List<QuizSchedule>();

    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}
