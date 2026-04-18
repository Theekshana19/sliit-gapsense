using GapSense.Application.DTOs;

namespace GapSense.Application.Services;

public interface INotificationService
{
    Task<IReadOnlyList<NotificationResponse>> GetForUserAsync(Guid userId,
        CancellationToken cancellationToken = default);

    Task MarkReadAsync(Guid userId, Guid notificationId, CancellationToken cancellationToken = default);

    Task MarkAllReadAsync(Guid userId, CancellationToken cancellationToken = default);

    Task DeleteAllForUserAsync(Guid userId, CancellationToken cancellationToken = default);

    Task CreateAsync(Guid userId, string title, string message, string type,
        CancellationToken cancellationToken = default);
}
