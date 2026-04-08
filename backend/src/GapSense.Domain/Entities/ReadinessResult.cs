namespace GapSense.Domain.Entities;

/// <summary>
/// Persisted readiness diagnostic used for reporting (PDF export, future API).
/// </summary>
public class ReadinessResult
{
    public Guid Id { get; set; }

    public string StudentName { get; set; } = string.Empty;
    public string StudentId { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public string SemesterLabel { get; set; } = string.Empty;
    public string AttemptLabel { get; set; } = string.Empty;
    public string AnalysisDateLabel { get; set; } = string.Empty;

    public int TotalScorePercent { get; set; }

    /// <summary>lowercase: high | medium | low</summary>
    public string RiskLevel { get; set; } = string.Empty;
    public string RiskDescription { get; set; } = string.Empty;

    public int WeakTopicsCount { get; set; }
    public string WeakTopicsSeverityLabel { get; set; } = string.Empty;
    public string WeakTopicsHelperText { get; set; } = string.Empty;

    public int ActionPlanRecommendationCount { get; set; }
    public string ActionPlanBadgeLabel { get; set; } = string.Empty;
    public string ActionPlanHelperText { get; set; } = string.Empty;

    public string InterpretationMessage { get; set; } = string.Empty;

    /// <summary>JSON array: [{"topicName":"...","percent":28}, ...]</summary>
    public string TopicPerformanceJson { get; set; } = "[]";
}
