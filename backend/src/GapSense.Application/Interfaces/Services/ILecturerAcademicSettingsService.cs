using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface ILecturerAcademicSettingsService
{
    Task<LecturerAcademicSettingsResponse?> GetAsync(Guid id, CancellationToken ct);
    Task<LecturerAcademicSettingsResponse?> GetByLecturerAsync(Guid lecturerProfileId, CancellationToken ct);
    Task<LecturerAcademicSettingsResponse?> UpdateAsync(Guid id, UpdateLecturerAcademicSettingsRequest request, CancellationToken ct);
}
