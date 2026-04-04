using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GapSense.Domain.Entities;

// junction table - links a quiz to its questions
// each row means "this question is part of this quiz"
// has sort order and marks (marks can differ per quiz)
[Table("QuizQuestions")]
public class QuizQuestion
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // which quiz
    [Required]
    public Guid QuizId { get; set; }

    // which question
    [Required]
    public Guid QuestionId { get; set; }

    // order of this question in the quiz (1, 2, 3...)
    public int SortOrder { get; set; }

    // marks for this question in this specific quiz
    // (same question can have different marks in different quizzes)
    [Range(1, 100)]
    public int Marks { get; set; }

    // navigation properties
    [ForeignKey("QuizId")]
    public Quiz Quiz { get; set; } = null!;

    [ForeignKey("QuestionId")]
    public Question Question { get; set; } = null!;
}
