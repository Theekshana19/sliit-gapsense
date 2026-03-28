namespace GapSense.Models.DTOs.Readiness;

// stats shown at the top of submission tracking page
public class SubmissionStatsDto
{
    public int TotalCompletionRate { get; set; }
    public int InProgressCount { get; set; }
    public int PendingReminders { get; set; }
    public int TotalEnrollments { get; set; }
}
