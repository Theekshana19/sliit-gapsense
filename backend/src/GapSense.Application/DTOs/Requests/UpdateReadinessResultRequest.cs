namespace GapSense.Application.DTOs.Requests;

public sealed record UpdateReadinessResultRequest(
    string StudentId,
    string ModuleCode,
    string Batch,
    string Semester,
    Guid? SemesterId,
    decimal ReadinessScore,
    string Status,
    bool IsActive
);
