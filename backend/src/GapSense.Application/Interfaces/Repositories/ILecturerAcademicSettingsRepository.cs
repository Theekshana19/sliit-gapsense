using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface ILecturerAcademicSettingsRepository
{
    Task<LecturerAcademicSettings?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<LecturerAcademicSettings?> GetByIdTrackedAsync(Guid id, CancellationToken ct);
    Task<LecturerAcademicSettings?> GetByLecturerProfileIdAsync(Guid lecturerProfileId, CancellationToken ct);
    Task UpdateAsync(LecturerAcademicSettings entity, CancellationToken ct);
}
