using GapSense.Domain.Enums;

namespace GapSense.Application.DTOs;

public record RecommendationRuleResponse
{
    public Guid Id { get; init; }
    public string RuleName { get; init; } = string.Empty;
    public string ModuleCode { get; init; } = string.Empty;
    public string ModuleName { get; init; } = string.Empty;
    public string TopicName { get; init; } = string.Empty;
    public RecommendationConditionType ConditionType { get; init; }
    public int ScoreThreshold { get; init; }
    public string RecommendationTitle { get; init; } = string.Empty;
    public string ResourceType { get; init; } = string.Empty;
    public RecommendationPriorityLevel PriorityLevel { get; init; }
    public string? ResourceUrl { get; init; }
    public string? AttachmentPath { get; init; }
    public string? AdministrativeRationale { get; init; }
    public RecommendationRuleStatus Status { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
