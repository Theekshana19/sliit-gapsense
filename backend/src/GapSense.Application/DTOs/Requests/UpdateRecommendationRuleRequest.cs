namespace GapSense.Application.DTOs.Requests;

public sealed record UpdateRecommendationRuleRequest(
    string RuleName,
    string RiskLevel,
    string ResourceType,
    string ActionText,
    bool IsActive
);

