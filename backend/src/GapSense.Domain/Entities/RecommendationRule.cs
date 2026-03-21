using GapSense.Domain.Enums;

namespace GapSense.Domain.Entities;

public class RecommendationRule
{
    public Guid Id { get; set; }
    public string RuleName { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public string TopicName { get; set; } = string.Empty;
    public RecommendationConditionType ConditionType { get; set; }
    public int ScoreThreshold { get; set; }
    public string RecommendationTitle { get; set; } = string.Empty;
    public string ResourceType { get; set; } = string.Empty;
    public RecommendationPriorityLevel PriorityLevel { get; set; }
    public string? ResourceUrl { get; set; }
    public string? AttachmentPath { get; set; }
    public string? AdministrativeRationale { get; set; }
    public RecommendationRuleStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
