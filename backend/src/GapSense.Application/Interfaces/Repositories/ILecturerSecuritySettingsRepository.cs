using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface ILecturerSecuritySettingsRepository
{
    Task<LecturerSecuritySettings?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<LecturerSecuritySettings?> GetByIdTrackedAsync(Guid id, CancellationToken ct);
    Task<LecturerSecuritySettings?> GetByLecturerProfileIdAsync(Guid lecturerProfileId, CancellationToken ct);
    Task UpdateAsync(LecturerSecuritySettings entity, CancellationToken ct);
}
