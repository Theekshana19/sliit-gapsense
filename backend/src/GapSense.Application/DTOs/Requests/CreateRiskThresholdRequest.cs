namespace GapSense.Application.DTOs.Requests;

public sealed record CreateRiskThresholdRequest(
    string ModuleCode,
    string Batch,
    string Semester,
    int HighRiskBelowPercent,
    int MediumRiskBelowPercent
);

