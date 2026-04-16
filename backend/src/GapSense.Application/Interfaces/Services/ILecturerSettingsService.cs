using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface ILecturerSettingsService
{
    Task<LecturerSettingsBundleResponse> GetBundleAsync(CancellationToken ct);
    Task<LecturerProfileResponse> GetProfileAsync(CancellationToken ct);
    Task<LecturerProfileResponse> UpdateProfileAsync(UpdateLecturerProfileRequest request, CancellationToken ct);
    Task<LecturerAcademicSettingsResponse> GetAcademicAsync(CancellationToken ct);
    Task<LecturerAcademicSettingsResponse> UpdateAcademicAsync(UpdateLecturerAcademicSettingsRequest request, CancellationToken ct);
    Task<LecturerNotificationSettingsResponse> GetNotificationsAsync(CancellationToken ct);
    Task<LecturerNotificationSettingsResponse> UpdateNotificationsAsync(UpdateLecturerNotificationSettingsRequest request, CancellationToken ct);
    Task<LecturerSecuritySettingsResponse> GetSecurityAsync(CancellationToken ct);
    Task<LecturerSecuritySettingsResponse> UpdateSecurityAsync(UpdateLecturerSecuritySettingsRequest request, CancellationToken ct);
    Task LogoutAllDevicesAsync(CancellationToken ct);
}
