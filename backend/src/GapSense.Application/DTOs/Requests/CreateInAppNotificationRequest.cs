using GapSense.Domain.Enums;

namespace GapSense.Application.DTOs.Requests;

public sealed record CreateInAppNotificationRequest(
    Guid LecturerProfileId,
    string Title,
    string Message,
    NotificationKind Type);
