namespace GapSense.Application.DTOs.Responses;

public sealed record ReadinessResultResponse(
    Guid Id,
    string StudentId,
    string ModuleCode,
    string Batch,
    string Semester,
    decimal ReadinessScore,
    string Status,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

