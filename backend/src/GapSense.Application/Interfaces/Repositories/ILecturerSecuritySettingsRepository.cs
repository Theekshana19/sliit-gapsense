using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface ILecturerSecuritySettingsRepository
{
    Task<LecturerSecuritySettings?> GetByLecturerIdAsync(Guid lecturerProfileId, CancellationToken ct);
    Task AddAsync(LecturerSecuritySettings entity, CancellationToken ct);
    Task UpdateAsync(LecturerSecuritySettings entity, CancellationToken ct);
}
