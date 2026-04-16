namespace GapSense.Application.DTOs.Requests;

public sealed record CreateInterventionAssignmentRequest(
    Guid StudentProfileId,
    string AssignedToName,
    string AssignedToRole,
    string InterventionType,
    string Priority,
    string? Note,
    DateTime DueDate,
    DateTime? FollowUpDate,
    string Status
);
