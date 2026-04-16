namespace GapSense.Application.DTOs.Responses;

public sealed record InterventionPlanningDashboardResponse(
    decimal SuccessRatePercent,
    string SuccessSummary,
    int PendingActionsCount,
    IReadOnlyList<string> PendingActionLines);
