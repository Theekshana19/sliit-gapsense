using System.ComponentModel.DataAnnotations;

namespace GapSense.Application.DTOs.Readiness;

// what the frontend sends when creating a quiz
public class CreateQuizDto
{
    [Required(ErrorMessage = "Quiz title is required")]
    [StringLength(300, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Module is required")]
    public Guid ModuleId { get; set; }

    [StringLength(50)]
    public string Intake { get; set; } = string.Empty;

    [Range(0, 100)]
    public int PassingPercentage { get; set; } = 40;

    [Range(1, 300)]
    public int TimeLimitMinutes { get; set; } = 60;

    [Range(1, 10)]
    public int MaxAttempts { get; set; } = 1;

    public bool ShuffleQuestions { get; set; } = false;
    public bool ShuffleOptions { get; set; } = false;

    public string Status { get; set; } = "Draft";

    // questions to include in this quiz
    [Required(ErrorMessage = "At least one question is required")]
    public List<CreateQuizQuestionDto> Questions { get; set; } = new();
}

// question assignment for creating a quiz
public class CreateQuizQuestionDto
{
    [Required]
    public Guid QuestionId { get; set; }

    public int Order { get; set; }
    public int Marks { get; set; }
}
