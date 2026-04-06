namespace GapSense.Application.DTOs.Requests;

public sealed record UpdateLecturerSecuritySettingsRequest(
    string? NewPassword,
    bool TwoFactorEnabled,
    bool IsActive);
