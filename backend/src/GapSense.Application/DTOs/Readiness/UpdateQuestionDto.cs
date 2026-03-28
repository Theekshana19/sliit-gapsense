using System.ComponentModel.DataAnnotations;

namespace GapSense.Application.DTOs.Readiness;

// what the frontend sends when updating a question
public class UpdateQuestionDto
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(300, MinimumLength = 5)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(2000)]
    public string QuestionText { get; set; } = string.Empty;

    [Required]
    public string QuestionType { get; set; } = "MCQ";

    [Required]
    public string Difficulty { get; set; } = "Easy";

    public Guid? TopicId { get; set; }

    [StringLength(1000)]
    public string Explanation { get; set; } = string.Empty;

    [Required]
    [Range(1, 100)]
    public int Marks { get; set; } = 5;

    public string Status { get; set; } = "Draft";

    // updated options list (replaces all existing options)
    public List<CreateOptionDto> Options { get; set; } = new();

    public int CorrectOptionIndex { get; set; }
}
