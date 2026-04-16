using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface IReadinessResultRepository
{
    Task<ReadinessResult?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyList<ReadinessResult>> ListAsync(CancellationToken ct);

    /// <summary>Readiness snapshots for trend charts, scoped to a semester.</summary>
    Task<IReadOnlyList<ReadinessResult>> ListForTrendBySemesterAsync(Guid semesterId, CancellationToken ct);
    Task AddAsync(ReadinessResult entity, CancellationToken ct);
    Task UpdateAsync(ReadinessResult entity, CancellationToken ct);
    Task DeleteAsync(ReadinessResult entity, CancellationToken ct);
}

