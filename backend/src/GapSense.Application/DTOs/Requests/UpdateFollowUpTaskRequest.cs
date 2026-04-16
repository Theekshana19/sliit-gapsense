using GapSense.Domain.Enums;

namespace GapSense.Application.DTOs.Requests;

public sealed record UpdateFollowUpTaskRequest(
    string Title,
    string? Description,
    DateTime DueDate,
    FollowUpStatus Status,
    FollowUpPriority Priority,
    string AssignedTo,
    bool IsDismissed);
