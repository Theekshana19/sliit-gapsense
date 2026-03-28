using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GapSense.Models.Entities;

// represents a readiness quiz that students take before starting a module
// a quiz contains multiple questions selected from the question bank
[Table("Quizzes")]
public class Quiz
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // quiz title like "Mid-Semester Assessment - Data Structures"
    [Required]
    [StringLength(300)]
    public string Title { get; set; } = string.Empty;

    // description of what this quiz covers
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    // which module this quiz is for (FK to Sewwandi's Modules table)
    [Required]
    public Guid ModuleId { get; set; }

    // which intake batch (e.g. "February 2024")
    [StringLength(50)]
    public string Intake { get; set; } = string.Empty;

    // total marks for the quiz (sum of all question marks)
    public int TotalMarks { get; set; }

    // what percentage is needed to pass (0-100)
    [Range(0, 100)]
    public int PassingPercentage { get; set; } = 40;

    // how many minutes students get to complete the quiz
    [Range(1, 300)]
    public int TimeLimitMinutes { get; set; } = 60;

    // how many times a student can attempt this quiz
    [Range(1, 10)]
    public int MaxAttempts { get; set; } = 1;

    // randomize question order?
    public bool ShuffleQuestions { get; set; } = false;

    // randomize option order within each question?
    public bool ShuffleOptions { get; set; } = false;

    // Draft, Published, Scheduled, Active, or Closed
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Draft";

    // timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // navigation properties
    [ForeignKey("ModuleId")]
    public Module Module { get; set; } = null!;

    // questions assigned to this quiz (through junction table)
    public ICollection<QuizQuestion> QuizQuestions { get; set; } = new List<QuizQuestion>();

    // schedules for this quiz
    public ICollection<QuizSchedule> Schedules { get; set; } = new List<QuizSchedule>();

    // student submissions for this quiz
    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}
