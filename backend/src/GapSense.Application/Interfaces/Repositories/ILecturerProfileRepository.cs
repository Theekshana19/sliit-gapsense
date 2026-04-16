using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface ILecturerProfileRepository
{
    Task<LecturerProfile?> GetDefaultActiveAsync(CancellationToken ct);
    Task AddAsync(LecturerProfile entity, CancellationToken ct);
    Task UpdateAsync(LecturerProfile entity, CancellationToken ct);
}
