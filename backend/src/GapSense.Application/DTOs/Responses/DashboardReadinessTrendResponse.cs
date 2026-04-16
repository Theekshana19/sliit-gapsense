namespace GapSense.Application.DTOs.Responses;

public sealed record DashboardReadinessTrendPointResponse(
    string Label,
    decimal CurrentPeriod,
    decimal PreviousPeriod
);

public sealed record DashboardReadinessTrendResponse(
    int CurrentYearLabel,
    int PreviousYearLabel,
    IReadOnlyList<DashboardReadinessTrendPointResponse> Points
);
