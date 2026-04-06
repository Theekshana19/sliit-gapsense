using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface ILecturerNotificationSettingsRepository
{
    Task<LecturerNotificationSettings?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<LecturerNotificationSettings?> GetByIdTrackedAsync(Guid id, CancellationToken ct);
    Task<LecturerNotificationSettings?> GetByLecturerProfileIdAsync(Guid lecturerProfileId, CancellationToken ct);
    Task UpdateAsync(LecturerNotificationSettings entity, CancellationToken ct);
}
