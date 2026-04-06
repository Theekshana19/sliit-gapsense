namespace GapSense.Application.DTOs.Responses;

public sealed record LecturerSecuritySettingsResponse(
    Guid Id,
    Guid LecturerProfileId,
    bool TwoFactorEnabled,
    DateTime? LastLogoutAllDevicesUtc,
    bool HasPasswordSet,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
