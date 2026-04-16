using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface IInterventionAssignmentRepository
{
    Task<InterventionAssignment?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<InterventionAssignment?> GetTrackedByIdAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyList<InterventionAssignment>> ListAllAsync(CancellationToken ct);
    Task<IReadOnlyList<InterventionAssignment>> ListByStudentProfileIdAsync(Guid studentProfileId, CancellationToken ct);
    Task<int> CountActivePipelineAsync(CancellationToken ct);
    Task AddAsync(InterventionAssignment entity, CancellationToken ct);
    Task UpdateAsync(InterventionAssignment entity, CancellationToken ct);
}
