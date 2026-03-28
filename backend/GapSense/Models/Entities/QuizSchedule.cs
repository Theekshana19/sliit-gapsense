using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GapSense.Models.Entities;

// defines when a quiz is available for students to take
// sets the time window (start date to end date) and attempt limits
[Table("QuizSchedules")]
public class QuizSchedule
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // which quiz this schedule is for
    [Required]
    public Guid QuizId { get; set; }

    // when the quiz becomes available
    [Required]
    public DateTime StartDate { get; set; }

    // when the quiz closes (must be after start date)
    [Required]
    public DateTime EndDate { get; set; }

    // max attempts for this schedule window
    [Range(1, 10)]
    public int MaxAttempts { get; set; } = 1;

    // when to show results - Immediate, AfterWindow, or Manual
    [Required]
    [StringLength(20)]
    public string ResultVisibility { get; set; } = "Immediate";

    // status - same options as quiz status
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Draft";

    // when this schedule was created
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // navigation property
    [ForeignKey("QuizId")]
    public Quiz Quiz { get; set; } = null!;
}
