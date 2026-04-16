namespace GapSense.Application.DTOs.Responses;

public sealed record ReadinessResultResponse(
    Guid Id,
    string StudentId,
    string ModuleCode,
    string Batch,
    string Semester,
    Guid? SemesterId,
    decimal ReadinessScore,
    string Status,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

