using System.ComponentModel.DataAnnotations;

namespace GapSense.Application.DTOs.Readiness;

// what the frontend sends when creating a new question
public class CreateQuestionDto
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(300, MinimumLength = 5, ErrorMessage = "Title must be between 5 and 300 characters")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Question text is required")]
    [StringLength(2000)]
    public string QuestionText { get; set; } = string.Empty;

    [Required]
    public string QuestionType { get; set; } = "MCQ";

    [Required]
    public string Difficulty { get; set; } = "Easy";

    [Required(ErrorMessage = "Module is required")]
    public Guid ModuleId { get; set; }

    public Guid? TopicId { get; set; }

    [StringLength(1000)]
    public string Explanation { get; set; } = string.Empty;

    [Required]
    [Range(1, 100, ErrorMessage = "Marks must be between 1 and 100")]
    public int Marks { get; set; } = 5;

    public string Status { get; set; } = "Draft";

    // the MCQ options to create along with the question
    [Required(ErrorMessage = "At least 2 options are required")]
    public List<CreateOptionDto> Options { get; set; } = new();

    // which option is the correct answer (index in the options list)
    public int CorrectOptionIndex { get; set; }
}

// option data sent when creating a question
public class CreateOptionDto
{
    [Required]
    [StringLength(500)]
    public string OptionText { get; set; } = string.Empty;

    public bool IsCorrect { get; set; } = false;
}
