namespace GapSense.Application.DTOs.Responses;

public sealed record DashboardSummaryResponse(
    Guid SemesterId,
    string SemesterName,
    int TotalStudents,
    int ActiveModules,
    int HighRiskStudents,
    decimal AverageReadinessScore,
    string? TotalStudentsTrendNote,
    string? HighRiskTrendNote,
    string? ReadinessTargetNote
);
