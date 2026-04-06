namespace GapSense.Application.DTOs.Responses;

public sealed record LecturerNotificationSettingsResponse(
    Guid Id,
    Guid LecturerProfileId,
    bool EmailAlerts,
    bool StudentRiskAlerts,
    bool AssignmentReminders,
    bool WeeklyReports,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
