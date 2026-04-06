using GapSense.Domain.Enums;

namespace GapSense.Application.DTOs.Responses;

public sealed record InAppNotificationResponse(
    Guid Id,
    Guid LecturerProfileId,
    string Title,
    string Message,
    NotificationKind Type,
    bool IsRead,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
