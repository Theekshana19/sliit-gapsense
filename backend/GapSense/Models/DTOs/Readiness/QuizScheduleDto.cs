namespace GapSense.Models.DTOs.Readiness;

// what we send back for quiz schedules
public class QuizScheduleDto
{
    public Guid Id { get; set; }
    public string QuizId { get; set; } = string.Empty;
    public string QuizTitle { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public int MaxAttempts { get; set; }
    public string ResultVisibility { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int QuestionCount { get; set; }
    public string QuestionType { get; set; } = string.Empty;
}
