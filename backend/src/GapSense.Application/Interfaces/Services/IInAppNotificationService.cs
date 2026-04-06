using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Domain.Enums;

namespace GapSense.Application.Interfaces.Services;

public interface IInAppNotificationService
{
    Task<IReadOnlyList<InAppNotificationResponse>> ListForLecturerAsync(Guid lecturerProfileId, NotificationKind? type, CancellationToken ct);
    Task<int> GetUnreadCountAsync(Guid lecturerProfileId, CancellationToken ct);
    Task<InAppNotificationResponse?> GetAsync(Guid id, CancellationToken ct);
    Task<InAppNotificationResponse> CreateAsync(CreateInAppNotificationRequest request, CancellationToken ct);
    Task<InAppNotificationResponse?> UpdateAsync(Guid id, UpdateInAppNotificationRequest request, CancellationToken ct);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct);
    Task<bool> MarkReadAsync(Guid id, CancellationToken ct);
    Task MarkAllReadAsync(Guid lecturerProfileId, CancellationToken ct);
    Task ClearAllAsync(Guid lecturerProfileId, CancellationToken ct);
}
