using GapSense.Domain.Enums;

namespace GapSense.Application.DTOs.Requests;

public sealed record UpdateInAppNotificationRequest(
    string Title,
    string Message,
    NotificationKind Type,
    bool IsRead,
    bool IsActive);
