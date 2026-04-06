using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface ILecturerSecuritySettingsService
{
    Task<LecturerSecuritySettingsResponse?> GetAsync(Guid id, CancellationToken ct);
    Task<LecturerSecuritySettingsResponse?> GetByLecturerAsync(Guid lecturerProfileId, CancellationToken ct);
    Task<LecturerSecuritySettingsResponse?> UpdateAsync(Guid id, UpdateLecturerSecuritySettingsRequest request, CancellationToken ct);
}
