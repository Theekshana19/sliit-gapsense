namespace GapSense.Application.DTOs;

public record ReadinessTopicPerformanceDto
{
    public required string TopicName { get; init; }
    public required int Percent { get; init; }
}

public record ReadinessResultResponse
{
    public required Guid Id { get; init; }
    public required string StudentName { get; init; }
    public required string StudentId { get; init; }
    public required string ModuleCode { get; init; }
    public required string SemesterLabel { get; init; }
    public required string AttemptLabel { get; init; }
    public required string AnalysisDateLabel { get; init; }
    public required int TotalScorePercent { get; init; }
    public required string RiskLevel { get; init; }
    public required string RiskDescription { get; init; }
    public required int WeakTopicsCount { get; init; }
    public required string WeakTopicsSeverityLabel { get; init; }
    public required string WeakTopicsHelperText { get; init; }
    public required int ActionPlanRecommendationCount { get; init; }
    public required string ActionPlanBadgeLabel { get; init; }
    public required string ActionPlanHelperText { get; init; }
    public required string InterpretationMessage { get; init; }
    public required IReadOnlyList<ReadinessTopicPerformanceDto> TopicPerformance { get; init; }
}
