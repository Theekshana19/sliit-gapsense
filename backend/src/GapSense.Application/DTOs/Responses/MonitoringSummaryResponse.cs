namespace GapSense.Application.DTOs.Responses;

public sealed record ModuleRiskBarResponse(string Label, decimal Pct, bool IsHigh);
public sealed record SuggestedInterventionResponse(string Title, string Description);

public sealed record MonitoringSummaryResponse(
    int CriticalRiskCases,
    int ActiveInterventions,
    int StudentsRecovered,
    decimal SuccessRatePercent,
    IReadOnlyList<ModuleRiskBarResponse> ModuleRiskBars,
    IReadOnlyList<SuggestedInterventionResponse> SuggestedInterventions,
    int TotalHighRiskMonitored
);
