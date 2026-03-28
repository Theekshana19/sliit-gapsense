namespace GapSense.Application.DTOs.Readiness;

// what we send back for a submission record
public class SubmissionDto
{
    public Guid Id { get; set; }
    public string QuizId { get; set; } = string.Empty;
    public string QuizTitle { get; set; } = string.Empty;
    public string QuizRef { get; set; } = string.Empty;
    public string StudentId { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string StudentAvatar { get; set; } = string.Empty;
    public string AvatarColor { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public int AttemptNumber { get; set; }
    public List<SubmissionAnswerDto> Answers { get; set; } = new();
    public int Score { get; set; }
    public int TotalMarks { get; set; }
    public decimal Percentage { get; set; }
    public string Status { get; set; } = string.Empty;
    public string StartedAt { get; set; } = string.Empty;
    public string SubmittedAt { get; set; } = string.Empty;
    public int TimeTakenMinutes { get; set; }
}
