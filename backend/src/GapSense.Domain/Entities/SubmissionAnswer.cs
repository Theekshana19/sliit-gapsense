using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GapSense.Domain.Entities;

// one answer within a submission - tracks what the student selected for each question
[Table("SubmissionAnswers")]
public class SubmissionAnswer
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // which submission this answer belongs to
    [Required]
    public Guid SubmissionId { get; set; }

    // which question was answered
    [Required]
    public Guid QuestionId { get; set; }

    // which option the student selected (null if skipped)
    public Guid? SelectedOptionId { get; set; }

    // was the answer correct?
    public bool IsCorrect { get; set; } = false;

    // marks awarded for this answer (0 if wrong)
    public int Marks { get; set; }

    // navigation properties
    [ForeignKey("SubmissionId")]
    public Submission Submission { get; set; } = null!;

    [ForeignKey("QuestionId")]
    public Question Question { get; set; } = null!;
}
