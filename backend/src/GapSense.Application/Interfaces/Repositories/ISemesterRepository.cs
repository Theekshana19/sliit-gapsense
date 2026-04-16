using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface ISemesterRepository
{
    Task<IReadOnlyList<Semester>> ListActiveOrderedAsync(CancellationToken ct);
    Task<IReadOnlyList<Semester>> ListOrderedAsync(CancellationToken ct);
    Task<Semester?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<Semester?> GetCurrentAsync(CancellationToken ct);
}
