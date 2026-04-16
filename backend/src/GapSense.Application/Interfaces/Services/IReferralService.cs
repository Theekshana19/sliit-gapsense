using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface IReferralService
{
    Task<IReadOnlyList<ReferralResponse>> ListByStudentAsync(Guid studentProfileId, CancellationToken ct);
    Task<ReferralResponse?> GetAsync(Guid id, CancellationToken ct);
    Task<ReferralResponse> CreateAsync(CreateReferralRequest request, CancellationToken ct);
    Task<ReferralResponse?> UpdateAsync(Guid id, UpdateReferralRequest request, CancellationToken ct);
}
