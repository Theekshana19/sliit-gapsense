namespace GapSense.Application.DTOs.Requests;

public sealed record UpdateRiskThresholdRequest(
    string ModuleCode,
    string Batch,
    string Semester,
    int HighRiskBelowPercent,
    int MediumRiskBelowPercent,
    bool IsActive
);

