using GapSense.Application.DTOs;

namespace GapSense.Application.Services;

public interface IRiskThresholdService
{
    Task<IReadOnlyList<RiskThresholdResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<RiskThresholdResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<RiskThresholdResponse> CreateAsync(CreateRiskThresholdRequest request, CancellationToken cancellationToken = default);
    Task<RiskThresholdResponse?> UpdateAsync(Guid id, UpdateRiskThresholdRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
