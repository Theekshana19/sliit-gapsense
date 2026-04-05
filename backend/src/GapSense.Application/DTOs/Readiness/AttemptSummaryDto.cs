namespace GapSense.Application.DTOs.Readiness;

// summary of one quiz attempt - shown in attempt history page
public class AttemptSummaryDto
{
    public Guid Id { get; set; }
    public string QuizId { get; set; } = string.Empty;
    public string QuizTitle { get; set; } = string.Empty;
    public string QuizRef { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public int AttemptNumber { get; set; }
    public int Score { get; set; }
    public int TotalMarks { get; set; }
    public decimal Percentage { get; set; }
    public string SubmittedAt { get; set; } = string.Empty;
    public int TimeTakenMinutes { get; set; }
    public string Status { get; set; } = string.Empty;
}
