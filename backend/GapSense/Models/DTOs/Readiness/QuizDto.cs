namespace GapSense.Models.DTOs.Readiness;

// what we send back when the frontend requests a quiz
public class QuizDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public string Intake { get; set; } = string.Empty;
    public List<QuizQuestionDto> Questions { get; set; } = new();
    public int TotalQuestions { get; set; }
    public int TotalMarks { get; set; }
    public int PassingMarks { get; set; }
    public int PassingPercentage { get; set; }
    public int TimeLimitMinutes { get; set; }
    public int MaxAttempts { get; set; }
    public bool ShuffleQuestions { get; set; }
    public bool ShuffleOptions { get; set; }
    public string Status { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
    public string UpdatedAt { get; set; } = string.Empty;
}

// question info inside a quiz
public class QuizQuestionDto
{
    public string QuestionId { get; set; } = string.Empty;
    public int Order { get; set; }
    public int Marks { get; set; }
}
