namespace GapSense.Application.DTOs.Requests;

public sealed record CreateRecommendationRuleRequest(
    string RuleName,
    string RiskLevel,
    string ResourceType,
    string ActionText
);

