using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface ILecturerAcademicSettingsRepository
{
    Task<LecturerAcademicSettings?> GetByLecturerIdAsync(Guid lecturerProfileId, CancellationToken ct);
    Task AddAsync(LecturerAcademicSettings entity, CancellationToken ct);
    Task UpdateAsync(LecturerAcademicSettings entity, CancellationToken ct);
}
