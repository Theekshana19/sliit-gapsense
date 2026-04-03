using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface IRiskThresholdService
{
    Task<IReadOnlyList<RiskThresholdResponse>> ListAsync(CancellationToken ct);
    Task<RiskThresholdResponse?> GetAsync(Guid id, CancellationToken ct);
    Task<RiskThresholdResponse> CreateAsync(CreateRiskThresholdRequest request, CancellationToken ct);
    Task<RiskThresholdResponse?> UpdateAsync(Guid id, UpdateRiskThresholdRequest request, CancellationToken ct);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct);
}

