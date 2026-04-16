namespace GapSense.Application.DTOs.Requests;

public sealed class UpdateLecturerSecuritySettingsRequest
{
    public string? CurrentPassword { get; init; }
    public string? NewPassword { get; init; }
    public string? ConfirmPassword { get; init; }
    public bool TwoFactorEnabled { get; init; }
    public bool LoginAlertEnabled { get; init; } = true;
    public int SessionTimeoutMinutes { get; init; } = 30;
}
