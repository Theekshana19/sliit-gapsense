using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface IRiskThresholdRepository
{
    Task<RiskThreshold?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyList<RiskThreshold>> ListAsync(CancellationToken ct);
    Task AddAsync(RiskThreshold entity, CancellationToken ct);
    Task UpdateAsync(RiskThreshold entity, CancellationToken ct);
    Task DeleteAsync(RiskThreshold entity, CancellationToken ct);
}

