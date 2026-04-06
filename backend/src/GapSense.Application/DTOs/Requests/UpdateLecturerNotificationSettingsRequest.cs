namespace GapSense.Application.DTOs.Requests;

public sealed record UpdateLecturerNotificationSettingsRequest(
    bool EmailAlerts,
    bool StudentRiskAlerts,
    bool AssignmentReminders,
    bool WeeklyReports,
    bool IsActive);
