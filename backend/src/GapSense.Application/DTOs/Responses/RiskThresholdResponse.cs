namespace GapSense.Application.DTOs.Responses;

public sealed record RiskThresholdResponse(
    Guid Id,
    string ModuleCode,
    string Batch,
    string Semester,
    int HighRiskBelowPercent,
    int MediumRiskBelowPercent,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

