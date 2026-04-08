using GapSense.Application.DTOs.Analytics;

namespace GapSense.Application.Services;

public interface IStudentAnalyticsService
{
    Task<WeakTopicAnalysisViewDto> GetWeakTopicAnalysisAsync(Guid userId, string? moduleCode,
        CancellationToken cancellationToken = default);

    Task<PersonalizedRecommendationsViewDto> GetPersonalizedRecommendationsAsync(Guid userId,
        CancellationToken cancellationToken = default);

    Task<StudentReadinessProfileViewDto> GetStudentReadinessProfileAsync(Guid userId,
        CancellationToken cancellationToken = default);

    Task<PersonalizedLearningPathViewDto> GetLearningPathAsync(Guid userId,
        CancellationToken cancellationToken = default);

    Task<ReassessmentComparisonViewDto> GetReassessmentComparisonAsync(Guid userId,
        CancellationToken cancellationToken = default);

    Task<RiskTrendsSummaryViewDto> GetRiskTrendsAsync(Guid userId,
        CancellationToken cancellationToken = default);
}
