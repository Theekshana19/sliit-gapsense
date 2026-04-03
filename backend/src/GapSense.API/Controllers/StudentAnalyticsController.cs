using System.Security.Claims;
using GapSense.API.Models;
using GapSense.Application.DTOs.Analytics;
using GapSense.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/student-analytics")]
[Authorize]
public class StudentAnalyticsController : ControllerBase
{
    private readonly IStudentAnalyticsService _analytics;

    public StudentAnalyticsController(IStudentAnalyticsService analytics)
    {
        _analytics = analytics;
    }

    [HttpGet("weak-topics")]
    public async Task<ActionResult<ApiResponse<WeakTopicAnalysisViewDto>>> WeakTopics(
        [FromQuery] string? moduleCode,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(ApiResponse<WeakTopicAnalysisViewDto>.Fail("Invalid user."));

        var data = await _analytics.GetWeakTopicAnalysisAsync(userId, moduleCode, cancellationToken);
        return Ok(ApiResponse<WeakTopicAnalysisViewDto>.Ok(data));
    }

    [HttpGet("recommendations")]
    public async Task<ActionResult<ApiResponse<PersonalizedRecommendationsViewDto>>> Recommendations(
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(ApiResponse<PersonalizedRecommendationsViewDto>.Fail("Invalid user."));

        var data = await _analytics.GetPersonalizedRecommendationsAsync(userId, cancellationToken);
        return Ok(ApiResponse<PersonalizedRecommendationsViewDto>.Ok(data));
    }

    [HttpGet("readiness-profile")]
    public async Task<ActionResult<ApiResponse<StudentReadinessProfileViewDto>>> ReadinessProfile(
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(ApiResponse<StudentReadinessProfileViewDto>.Fail("Invalid user."));

        var data = await _analytics.GetStudentReadinessProfileAsync(userId, cancellationToken);
        return Ok(ApiResponse<StudentReadinessProfileViewDto>.Ok(data));
    }

    [HttpGet("learning-path")]
    public async Task<ActionResult<ApiResponse<PersonalizedLearningPathViewDto>>> LearningPath(
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(ApiResponse<PersonalizedLearningPathViewDto>.Fail("Invalid user."));

        var data = await _analytics.GetLearningPathAsync(userId, cancellationToken);
        return Ok(ApiResponse<PersonalizedLearningPathViewDto>.Ok(data));
    }

    [HttpGet("reassessment")]
    public async Task<ActionResult<ApiResponse<ReassessmentComparisonViewDto>>> Reassessment(
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(ApiResponse<ReassessmentComparisonViewDto>.Fail("Invalid user."));

        var data = await _analytics.GetReassessmentComparisonAsync(userId, cancellationToken);
        return Ok(ApiResponse<ReassessmentComparisonViewDto>.Ok(data));
    }

    [HttpGet("risk-trends")]
    public async Task<ActionResult<ApiResponse<RiskTrendsSummaryViewDto>>> RiskTrends(
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(ApiResponse<RiskTrendsSummaryViewDto>.Fail("Invalid user."));

        var data = await _analytics.GetRiskTrendsAsync(userId, cancellationToken);
        return Ok(ApiResponse<RiskTrendsSummaryViewDto>.Ok(data));
    }

    private bool TryGetUserId(out Guid userId)
    {
        userId = default;
        var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return !string.IsNullOrWhiteSpace(idValue) && Guid.TryParse(idValue, out userId);
    }
}
