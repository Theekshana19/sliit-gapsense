namespace GapSense.Application.DTOs.Analytics;

// Weak topic analysis (matches frontend WeakTopicAnalysisViewModel shape, camelCase via serializer)

public record WeakTopicSummaryCardsDto
{
    public required int TotalTopicsEvaluated { get; init; }
    public required string TotalTopicsHelper { get; init; }
    public required int WeakTopicsIdentified { get; init; }
    public required string WeakTopicsHelper { get; init; }
    public required int CriticalWeakAreas { get; init; }
    public required string CriticalHelper { get; init; }
}

public record WeakTopicMatrixRowDto
{
    public required string TopicName { get; init; }
    public required string BlockLabel { get; init; }
    public required int CurrentScorePercent { get; init; }
    public required int ExpectedLevelPercent { get; init; }
    public required string WeaknessLevel { get; init; }
    public required string Status { get; init; }
}

public record InterventionItemDto
{
    public required string Icon { get; init; }
    public required string Tone { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
}

public record InterventionStrategyDto
{
    public required IReadOnlyList<InterventionItemDto> Items { get; init; }
}

public record ProjectionBarDto
{
    public required string Label { get; init; }
    public required int HeightPercent { get; init; }
    public required string Variant { get; init; }
}

public record ProjectionSummaryDto
{
    public required string Subtitle { get; init; }
    public required IReadOnlyList<ProjectionBarDto> Bars { get; init; }
    public required string InsightTemplate { get; init; }
    public required int InsightHighlightPercent { get; init; }
}

public record WeakTopicAnalysisViewDto
{
    public required WeakTopicSummaryCardsDto Summary { get; init; }
    public required IReadOnlyList<WeakTopicMatrixRowDto> MatrixRows { get; init; }
    public required InterventionStrategyDto Intervention { get; init; }
    public required ProjectionSummaryDto Projection { get; init; }
}

// Personalized recommendations

public record PrioritySectionConfigDto
{
    public required string Title { get; init; }
    public required string BadgeLabel { get; init; }
    public required string BadgeTone { get; init; }
}

public record RecommendationResourceInfoDto
{
    public required string Icon { get; init; }
    public required string Label { get; init; }
}

public record RecommendationActionDto
{
    public required string Label { get; init; }
}

public record HighPriorityRecommendationDto
{
    public required string Id { get; init; }
    public required string TopicLabel { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required RecommendationResourceInfoDto ResourceType { get; init; }
    public required RecommendationActionDto SuggestedAction { get; init; }
    public required string Status { get; init; }
    public string? ResourceUrl { get; init; }
    public bool DecorativeCircle { get; init; }
}

public record MediumPriorityRecommendationDto
{
    public required string Id { get; init; }
    public required string TopicLabel { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required string ResourceTypeIcon { get; init; }
    public required string ResourceTypeLabel { get; init; }
    public string? ImageUrl { get; init; }
    public string? ImageAlt { get; init; }
    public string? ResourceUrl { get; init; }
}

public record HighPriorityGroupDto
{
    public required PrioritySectionConfigDto Config { get; init; }
    public required IReadOnlyList<HighPriorityRecommendationDto> Items { get; init; }
}

public record MediumPriorityGroupDto
{
    public required PrioritySectionConfigDto Config { get; init; }
    public required IReadOnlyList<MediumPriorityRecommendationDto> Items { get; init; }
}

public record RecommendationInsightMetricDto
{
    public required string Value { get; init; }
    public required string Label { get; init; }
}

public record RecommendationInsightDto
{
    public required string BadgeLabel { get; init; }
    public required string Title { get; init; }
    public required string Explanation { get; init; }
    public required IReadOnlyList<RecommendationInsightMetricDto> Metrics { get; init; }
}

public record RecommendationRoadmapItemDto
{
    public required int StepNumber { get; init; }
    public required string Label { get; init; }
    public required string Status { get; init; }
}

public record RecommendationRoadmapDto
{
    public required string Title { get; init; }
    public required IReadOnlyList<RecommendationRoadmapItemDto> Items { get; init; }
    public required string UpdateButtonLabel { get; init; }
}

public record PersonalizedRecommendationsViewDto
{
    public required HighPriorityGroupDto HighPriority { get; init; }
    public required MediumPriorityGroupDto MediumPriority { get; init; }
    public required RecommendationInsightDto Insight { get; init; }
    public required RecommendationRoadmapDto Roadmap { get; init; }
}

// Learning path (matches PersonalizedLearningPathViewModel)

public record LearningPathSummaryDto
{
    public required string Label { get; init; }
    public required int ReadinessPercent { get; init; }
    public required string NextMilestoneLabel { get; init; }
    public required string NextMilestoneName { get; init; }
    public required int CompletedCount { get; init; }
    public required int TotalCount { get; init; }
    public required string HelperText { get; init; }
}

public record LearningPathResumeItemDto
{
    public required string Title { get; init; }
    public required string TopicName { get; init; }
    public required string ContinueLabel { get; init; }
}

public record LearningPathResourcePanelDto
{
    public required string Icon { get; init; }
    public required string Title { get; init; }
    public required string Subtext { get; init; }
    public required string ActionLabel { get; init; }
}

public record LearningPathMetadataItemDto
{
    public required string Icon { get; init; }
    public required string Label { get; init; }
}

public record LearningPathStepItemDto
{
    public required string Id { get; init; }
    public required int StepNumber { get; init; }
    public required string Title { get; init; }
    public required string Status { get; init; }
    public string? Date { get; init; }
    public string? BadgeLabel { get; init; }
    public string? RecommendationNote { get; init; }
    public IReadOnlyList<LearningPathMetadataItemDto>? Metadata { get; init; }
    public LearningPathResourcePanelDto? ResourcePanel { get; init; }
    public string? ActionLabel { get; init; }
    public string? UnlockNote { get; init; }
}

public record LearningPathFooterActionDto
{
    public required string Title { get; init; }
    public required string Subtitle { get; init; }
    public required string PrimaryButtonLabel { get; init; }
    public required string SecondaryButtonLabel { get; init; }
}

public record PersonalizedLearningPathViewDto
{
    public required LearningPathSummaryDto Summary { get; init; }
    public required LearningPathResumeItemDto ResumeItem { get; init; }
    public required IReadOnlyList<LearningPathStepItemDto> Steps { get; init; }
    public required LearningPathFooterActionDto FooterActions { get; init; }
}

// Student readiness profile (partial — list rows)

public record StudentAssessmentRowDto
{
    public required string Id { get; init; }
    public required string AssessmentName { get; init; }
    public required string Date { get; init; }
    public required string Score { get; init; }
    public required string Outcome { get; init; }
    public required string TrendDirection { get; init; }
    public required string TrendPercent { get; init; }
}

public record StudentReadinessProfileViewDto
{
    public required string StudentDisplayName { get; init; }
    public required string StudentCode { get; init; }
    public required IReadOnlyList<StudentAssessmentRowDto> RecentAssessments { get; init; }
}

// Reassessment comparison (matches ReassessmentComparisonViewModel)

public record ReassessmentImprovementDto
{
    public required string Label { get; init; }
    public required string Message { get; init; }
}

public record ReassessmentScoreSummaryDto
{
    public required string Label { get; init; }
    public required string Title { get; init; }
    public required string SessionDate { get; init; }
    public required string RiskBadge { get; init; }
    public required int ScorePercent { get; init; }
    public required bool IsHighRisk { get; init; }
}

public record ReassessmentTopicComparisonDto
{
    public required string TopicName { get; init; }
    public required int Attempt1Percent { get; init; }
    public required int ReassessmentPercent { get; init; }
    public required string GrowthText { get; init; }
}

public record ReassessmentTopicBreakdownDto
{
    public required string TopicName { get; init; }
    public required int BeforePercent { get; init; }
    public required int AfterPercent { get; init; }
    public required int ImprovementPercent { get; init; }
}

public record ReassessmentObservationDto
{
    public required string Label { get; init; }
    public required string Text { get; init; }
}

public record ReadinessCertificateActionDto
{
    public required string Title { get; init; }
    public required string Subtitle { get; init; }
    public required string ButtonLabel { get; init; }
}

public record ReassessmentComparisonViewDto
{
    public required ReassessmentImprovementDto ImprovementDelta { get; init; }
    public required ReassessmentScoreSummaryDto Attempt1Score { get; init; }
    public required ReassessmentScoreSummaryDto ReassessmentScore { get; init; }
    public required IReadOnlyList<ReassessmentTopicComparisonDto> TopicComparisons { get; init; }
    public required IReadOnlyList<ReassessmentTopicBreakdownDto> TopicBreakdown { get; init; }
    public required ReassessmentObservationDto Observation { get; init; }
    public required ReadinessCertificateActionDto CertificateAction { get; init; }
}

// Risk trends summary (matches RiskTrendsSummaryViewModel core fields)

public record RiskSummaryMetricDto
{
    public required string Id { get; init; }
    public required string Variant { get; init; }
    public required string Title { get; init; }
    public required string Value { get; init; }
    public string? BadgeText { get; init; }
    public string? BadgeStyle { get; init; }
    public int? ProgressPercent { get; init; }
    public string? HelperText { get; init; }
    public int? ExtraCount { get; init; }
    public string? PillLabel { get; init; }
    public required string Accent { get; init; }
}

public record RiskDistributionSegmentDto
{
    public required string Key { get; init; }
    public required string Label { get; init; }
    public required int Percent { get; init; }
    public required int Count { get; init; }
    public required string ColorClass { get; init; }
}

public record RiskDistributionDto
{
    public required int Total { get; init; }
    public required IReadOnlyList<RiskDistributionSegmentDto> Segments { get; init; }
}

public record WeakTopicFrequencyItemDto
{
    public required string TopicName { get; init; }
    public required int Frequency { get; init; }
    public int MaxFrequency { get; init; } = 100;
}

public record WeakTopicFrequencyDto
{
    public required IReadOnlyList<WeakTopicFrequencyItemDto> Items { get; init; }
    public required string SelectedPeriod { get; init; }
}

public record RiskInsightDto
{
    public required string Title { get; init; }
    public required string Text { get; init; }
    public string? Icon { get; init; }
}

public record RiskProgressionPointDto
{
    public required string Month { get; init; }
    public required int Value { get; init; }
}

public record PeakReadinessMarkerDto
{
    public required string Label { get; init; }
    public required string Value { get; init; }
    public required string Detail { get; init; }
    public required string MonthKey { get; init; }
}

public record RiskProgressionBlockDto
{
    public required string Title { get; init; }
    public required string Subtitle { get; init; }
    public required IReadOnlyList<RiskProgressionPointDto> CurrentCohortPoints { get; init; }
    public required IReadOnlyList<RiskProgressionPointDto> PreviousCohortPoints { get; init; }
    public required PeakReadinessMarkerDto PeakMarker { get; init; }
}

public record RiskTrendsSummaryViewDto
{
    public required IReadOnlyList<RiskSummaryMetricDto> SummaryMetrics { get; init; }
    public required RiskDistributionDto RiskDistribution { get; init; }
    public required WeakTopicFrequencyDto WeakTopicFrequency { get; init; }
    public required RiskInsightDto Insight { get; init; }
    public required RiskProgressionBlockDto RiskProgression { get; init; }
}
