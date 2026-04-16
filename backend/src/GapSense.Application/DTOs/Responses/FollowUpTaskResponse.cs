namespace GapSense.Application.DTOs.Responses;

public sealed record FollowUpTaskResponse(
    Guid Id,
    Guid StudentProfileId,
    string? StudentId,
    string? StudentFullName,
    string? StudentCurrentModule,
    string Title,
    string? Description,
    DateTime DueDate,
    string Status,
    string Priority,
    string AssignedTo,
    DateTime? ReminderSentAt,
    bool IsDismissed,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
