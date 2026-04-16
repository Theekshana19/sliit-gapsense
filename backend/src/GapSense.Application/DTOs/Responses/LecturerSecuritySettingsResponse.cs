namespace GapSense.Application.DTOs.Responses;

public sealed record LecturerSecuritySettingsResponse(
    Guid Id,
    bool TwoFactorEnabled,
    bool LoginAlertEnabled,
    int SessionTimeoutMinutes
);
