using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GapSense.Domain.Entities;

// one MCQ option for a question (like Option A, Option B, etc.)
// each question has multiple options, one of which is marked as correct
[Table("QuestionOptions")]
public class QuestionOption
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // which question this option belongs to
    [Required]
    public Guid QuestionId { get; set; }

    // the option text (what the student sees)
    [Required]
    [StringLength(500)]
    public string OptionText { get; set; } = string.Empty;

    // is this the correct answer?
    public bool IsCorrect { get; set; } = false;

    // display order (0, 1, 2, 3...)
    public int SortOrder { get; set; }

    // navigation property - link back to the question
    [ForeignKey("QuestionId")]
    public Question Question { get; set; } = null!;
}
