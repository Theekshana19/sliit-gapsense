using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface ILecturerNotificationSettingsService
{
    Task<LecturerNotificationSettingsResponse?> GetAsync(Guid id, CancellationToken ct);
    Task<LecturerNotificationSettingsResponse?> GetByLecturerAsync(Guid lecturerProfileId, CancellationToken ct);
    Task<LecturerNotificationSettingsResponse?> UpdateAsync(Guid id, UpdateLecturerNotificationSettingsRequest request, CancellationToken ct);
}
