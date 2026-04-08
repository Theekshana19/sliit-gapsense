using GapSense.Domain.Enums;

namespace GapSense.Application.DTOs;

public record CreateRecommendationRuleRequest
{
    public required string RuleName { get; init; }
    public required string ModuleCode { get; init; }
    public required string ModuleName { get; init; }
    public required string TopicName { get; init; }
    public RecommendationConditionType ConditionType { get; init; }
    public int ScoreThreshold { get; init; }
    public required string RecommendationTitle { get; init; }
    public required string ResourceType { get; init; }
    public RecommendationPriorityLevel PriorityLevel { get; init; }
    public string? ResourceUrl { get; init; }
    public string? AttachmentPath { get; init; }
    public string? AdministrativeRationale { get; init; }
    public RecommendationRuleStatus Status { get; init; }
}
