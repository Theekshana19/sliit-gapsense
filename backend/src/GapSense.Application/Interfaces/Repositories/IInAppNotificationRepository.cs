using GapSense.Domain.Entities;
using GapSense.Domain.Enums;

namespace GapSense.Application.Interfaces.Repositories;

public interface IInAppNotificationRepository
{
    Task<InAppNotification?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<InAppNotification?> GetByIdTrackedAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyList<InAppNotification>> ListByLecturerAsync(Guid lecturerProfileId, NotificationKind? type, CancellationToken ct);
    Task<int> CountUnreadAsync(Guid lecturerProfileId, CancellationToken ct);
    Task AddAsync(InAppNotification entity, CancellationToken ct);
    Task UpdateAsync(InAppNotification entity, CancellationToken ct);
    Task DeleteAsync(InAppNotification entity, CancellationToken ct);
    Task MarkAllReadAsync(Guid lecturerProfileId, CancellationToken ct);
    Task DeleteAllForLecturerAsync(Guid lecturerProfileId, CancellationToken ct);
}
