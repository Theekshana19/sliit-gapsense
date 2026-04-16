using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface INotificationFeedService
{
    Task<IReadOnlyList<NotificationFeedItemResponse>> GetRecentAsync(int take, CancellationToken ct);
    Task<int> GetUnreadCountAsync(CancellationToken ct);
    Task MarkReadAsync(Guid id, CancellationToken ct);
    Task MarkAllReadAsync(CancellationToken ct);
    Task ClearAllAsync(CancellationToken ct);

    /// <summary>
    /// Publish a notification immediately from a real module action (report generated, plan created, etc).
    /// Settings are enforced (disabled categories will be suppressed).
    /// </summary>
    Task PublishAsync(PublishNotificationRequest request, CancellationToken ct);
}
