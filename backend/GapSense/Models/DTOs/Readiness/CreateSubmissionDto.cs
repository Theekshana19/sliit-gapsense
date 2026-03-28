using System.ComponentModel.DataAnnotations;

namespace GapSense.Models.DTOs.Readiness;

// what the frontend sends when a student submits a quiz
public class CreateSubmissionDto
{
    [Required(ErrorMessage = "Quiz is required")]
    public Guid QuizId { get; set; }

    [Required(ErrorMessage = "Student ID is required")]
    public string StudentId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Student name is required")]
    public string StudentName { get; set; } = string.Empty;

    public string StudentAvatar { get; set; } = string.Empty;
    public string AvatarColor { get; set; } = string.Empty;

    // the answers the student selected
    [Required(ErrorMessage = "Answers are required")]
    public List<SubmitAnswerDto> Answers { get; set; } = new();
}

// one answer in the submission
public class SubmitAnswerDto
{
    [Required]
    public Guid QuestionId { get; set; }

    // which option the student selected (null if skipped)
    public Guid? SelectedOptionId { get; set; }
}
