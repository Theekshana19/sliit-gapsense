using GapSense.Application.DTOs.Responses;
using GapSense.Domain.Entities;

namespace GapSense.Application.Mappings;

public static class RecommendationRuleMappings
{
    public static RecommendationRuleResponse ToResponse(this RecommendationRule e) =>
        new(e.Id, e.RuleName, e.RiskLevel, e.ResourceType, e.ActionText, e.IsActive, e.CreatedAt, e.UpdatedAt);
}

