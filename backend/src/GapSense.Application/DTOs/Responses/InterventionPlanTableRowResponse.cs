namespace GapSense.Application.DTOs.Responses;

public sealed record InterventionPlanTableRowResponse(
    Guid Id,
    string ModuleCode,
    string Batch,
    string RiskGroup,
    string WeakTopic,
    string InterventionType,
    string PlannedDate,
    string Status,
    string? AssignedLecturer,
    string? Notes,
    bool IsDraft);
