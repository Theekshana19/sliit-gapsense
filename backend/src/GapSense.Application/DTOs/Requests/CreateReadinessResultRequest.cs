namespace GapSense.Application.DTOs.Requests;

public sealed record CreateReadinessResultRequest(
    string StudentId,
    string ModuleCode,
    string Batch,
    string Semester,
    decimal ReadinessScore,
    string Status
);

