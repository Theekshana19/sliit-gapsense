using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface ILecturerProfileRepository
{
    Task<LecturerProfile?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<LecturerProfile?> GetByIdTrackedAsync(Guid id, CancellationToken ct);
    Task<LecturerProfile?> GetByEmailAsync(string email, CancellationToken ct);
    Task<IReadOnlyList<LecturerProfile>> ListAsync(CancellationToken ct);
    Task AddAsync(LecturerProfile entity, CancellationToken ct);
    Task AddWithDefaultSettingsAsync(LecturerProfile entity, CancellationToken ct);
    Task UpdateAsync(LecturerProfile entity, CancellationToken ct);
    Task DeleteAsync(LecturerProfile entity, CancellationToken ct);
}
