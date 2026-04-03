using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

public sealed class RecommendationRule : BaseEntity
{
    public required string RuleName { get; set; }
    public required string RiskLevel { get; set; }
    public required string ResourceType { get; set; }
    public required string ActionText { get; set; }
}

