namespace GapSense.Application.DTOs.Responses;

public sealed record DashboardFullResponse(
    DashboardSummaryResponse Summary,
    DashboardReadinessTrendResponse ReadinessTrend,
    DashboardRiskDistributionResponse RiskDistribution,
    IReadOnlyList<DashboardMilestoneResponse> Milestones,
    DateTime GeneratedAtUtc,
    FollowUpQueueResponse FollowUpQueue,
    string? FollowUpQueueError);
