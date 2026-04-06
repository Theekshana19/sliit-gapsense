using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface ILecturerProfileService
{
    Task<IReadOnlyList<LecturerProfileResponse>> ListAsync(CancellationToken ct);
    Task<LecturerProfileResponse?> GetAsync(Guid id, CancellationToken ct);
    Task<LecturerProfileResponse> CreateAsync(CreateLecturerProfileRequest request, CancellationToken ct);
    Task<LecturerProfileResponse?> UpdateAsync(Guid id, UpdateLecturerProfileRequest request, CancellationToken ct);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct);
}
