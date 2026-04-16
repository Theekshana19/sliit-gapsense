using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface IInterventionPlanRepository
{
    Task<IReadOnlyList<InterventionPlan>> ListActiveAsync(CancellationToken ct);
    Task<InterventionPlan?> GetActiveByIdAsync(Guid id, CancellationToken ct);
    Task<InterventionPlan?> GetTrackedByIdAsync(Guid id, CancellationToken ct);
    Task AddAsync(InterventionPlan entity, CancellationToken ct);
    Task UpdateAsync(InterventionPlan entity, CancellationToken ct);
}
