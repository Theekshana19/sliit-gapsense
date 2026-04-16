namespace GapSense.Application.DTOs.Requests;

public sealed record UpdateInterventionAssignmentRequest(
    string AssignedToName,
    string AssignedToRole,
    string InterventionType,
    string Priority,
    string? Note,
    DateTime DueDate,
    DateTime? FollowUpDate,
    string Status,
    bool IsActive
);
