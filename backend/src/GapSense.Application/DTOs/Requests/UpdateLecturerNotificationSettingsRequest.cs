namespace GapSense.Application.DTOs.Requests;

public sealed class UpdateLecturerNotificationSettingsRequest
{
    public bool EmailAlerts { get; init; }
    public bool StudentRiskAlerts { get; init; }
    public bool AssignmentReminders { get; init; }
    public bool WeeklyReports { get; init; }
}
