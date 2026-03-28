using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GapSense.Domain.Entities;

// represents one student's attempt at a quiz
// tracks score, time taken, and all individual answers
[Table("Submissions")]
public class Submission
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // which quiz was attempted
    [Required]
    public Guid QuizId { get; set; }

    // student info
    [Required]
    [StringLength(20)]
    public string StudentId { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string StudentName { get; set; } = string.Empty;

    // initials for avatar display (e.g. "KP")
    [StringLength(5)]
    public string StudentAvatar { get; set; } = string.Empty;

    // css class for avatar background color
    [StringLength(50)]
    public string AvatarColor { get; set; } = string.Empty;

    // which attempt is this (1st, 2nd, 3rd...)
    [Required]
    public int AttemptNumber { get; set; } = 1;

    // score achieved (sum of correct answer marks)
    public int Score { get; set; }

    // maximum possible marks for this quiz
    public int TotalMarks { get; set; }

    // score as a percentage
    [Column(TypeName = "decimal(5,2)")]
    public decimal Percentage { get; set; }

    // Submitted, In Progress, Not Attempted, or Graded
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Not Attempted";

    // when the student started the quiz
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;

    // when the student submitted (null if still in progress)
    public DateTime? SubmittedAt { get; set; }

    // how long it took in minutes
    public int TimeTakenMinutes { get; set; }

    // when this record was created
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // navigation properties
    [ForeignKey("QuizId")]
    public Quiz Quiz { get; set; } = null!;

    // all the answers the student picked
    public ICollection<SubmissionAnswer> Answers { get; set; } = new List<SubmissionAnswer>();
}
