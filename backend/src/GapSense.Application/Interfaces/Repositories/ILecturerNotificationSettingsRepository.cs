using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface ILecturerNotificationSettingsRepository
{
    Task<LecturerNotificationSettings?> GetByLecturerIdAsync(Guid lecturerProfileId, CancellationToken ct);
    Task AddAsync(LecturerNotificationSettings entity, CancellationToken ct);
    Task UpdateAsync(LecturerNotificationSettings entity, CancellationToken ct);
}
