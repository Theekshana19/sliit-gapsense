using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GapSense.Domain.Entities;

// represents a readiness quiz question
// each question belongs to a module and optionally a topic
// has multiple MCQ options, one of which is correct
[Table("Questions")]
public class Question
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // display ID shown in the UI like "QB-IT2040-001"
    [Required]
    [StringLength(20)]
    public string QuestionDisplayId { get; set; } = string.Empty;

    // short title for the question
    [Required]
    [StringLength(300)]
    public string Title { get; set; } = string.Empty;

    // the full question text that students read
    [Required]
    [StringLength(2000)]
    public string QuestionText { get; set; } = string.Empty;

    // MCQ or TRUE_FALSE
    [Required]
    [StringLength(20)]
    public string QuestionType { get; set; } = "MCQ";

    // Easy, Medium, or Hard
    [Required]
    [StringLength(20)]
    public string Difficulty { get; set; } = "Easy";

    // which module this question belongs to (FK to Sewwandi's Modules table)
    [Required]
    public Guid ModuleId { get; set; }

    // which topic this question is about (FK to Sewwandi's Topics table)
    // nullable because some questions might not be linked to a specific topic
    public Guid? TopicId { get; set; }

    // explanation shown after answering - why the correct answer is correct
    [StringLength(1000)]
    public string Explanation { get; set; } = string.Empty;

    // how many marks this question is worth
    [Required]
    [Range(1, 100)]
    public int Marks { get; set; } = 5;

    // Active, Draft, or Archived
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Draft";

    // timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // navigation properties
    [ForeignKey("ModuleId")]
    public Module Module { get; set; } = null!;

    [ForeignKey("TopicId")]
    public Topic? Topic { get; set; }

    // one question has many options (A, B, C, D etc.)
    public ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
}
