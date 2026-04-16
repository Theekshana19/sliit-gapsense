namespace GapSense.Application.DTOs.Responses;

public sealed record DashboardRiskSliceResponse(
    string Level,
    int Count,
    decimal Percent
);

public sealed record DashboardRiskDistributionResponse(
    int TotalAtRisk,
    IReadOnlyList<DashboardRiskSliceResponse> Slices
);
