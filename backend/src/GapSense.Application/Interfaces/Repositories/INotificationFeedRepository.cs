using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface INotificationFeedRepository
{
    Task<NotificationFeedItem?> GetBySourceAsync(Guid lecturerProfileId, string sourceType, string sourceKey, CancellationToken ct);
    Task<IReadOnlyList<NotificationFeedItem>> GetRecentAsync(Guid lecturerProfileId, int take, CancellationToken ct);
    Task<int> GetUnreadCountAsync(Guid lecturerProfileId, CancellationToken ct);
    Task<NotificationFeedItem?> GetByIdAsync(Guid lecturerProfileId, Guid id, CancellationToken ct);
    Task AddAsync(NotificationFeedItem entity, CancellationToken ct);
    Task UpdateAsync(NotificationFeedItem entity, CancellationToken ct);
    Task MarkAllReadAsync(Guid lecturerProfileId, CancellationToken ct);
    Task ClearAllAsync(Guid lecturerProfileId, CancellationToken ct);
}
