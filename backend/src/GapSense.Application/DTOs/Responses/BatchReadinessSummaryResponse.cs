namespace GapSense.Application.DTOs.Responses;

public sealed record BatchReadinessSummaryResponse(
    int TotalStudents,
    int HighRiskCount,
    int BatchReadinessScorePercent,
    decimal? ScoreDeltaPercent,
    int InterventionPendingCount,
    decimal? AverageCohortImprovementPercent,
    DateTime GeneratedAtUtc);
