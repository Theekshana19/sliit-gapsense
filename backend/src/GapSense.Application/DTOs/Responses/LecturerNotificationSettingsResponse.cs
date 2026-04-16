namespace GapSense.Application.DTOs.Responses;

public sealed record LecturerNotificationSettingsResponse(
    Guid Id,
    bool EmailAlerts,
    bool StudentRiskAlerts,
    bool AssignmentReminders,
    bool WeeklyReports
);
