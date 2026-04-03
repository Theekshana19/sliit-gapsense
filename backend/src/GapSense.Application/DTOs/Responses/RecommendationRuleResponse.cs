namespace GapSense.Application.DTOs.Responses;

public sealed record RecommendationRuleResponse(
    Guid Id,
    string RuleName,
    string RiskLevel,
    string ResourceType,
    string ActionText,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

