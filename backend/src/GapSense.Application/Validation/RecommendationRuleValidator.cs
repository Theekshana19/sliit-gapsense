using GapSense.Application.DTOs;

namespace GapSense.Application.Validation;

public static class RecommendationRuleValidator
{
    public static IEnumerable<string> ValidateCreate(CreateRecommendationRuleRequest request)
    {
        return ValidateCommon(
            request.RuleName,
            request.ModuleCode,
            request.TopicName,
            request.ScoreThreshold,
            request.RecommendationTitle,
            request.ResourceType);
    }

    public static IEnumerable<string> ValidateUpdate(UpdateRecommendationRuleRequest request)
    {
        return ValidateCommon(
            request.RuleName,
            request.ModuleCode,
            request.TopicName,
            request.ScoreThreshold,
            request.RecommendationTitle,
            request.ResourceType);
    }

    private static IEnumerable<string> ValidateCommon(
        string ruleName,
        string moduleCode,
        string topicName,
        int scoreThreshold,
        string recommendationTitle,
        string resourceType)
    {
        if (string.IsNullOrWhiteSpace(ruleName))
            yield return "Rule name is required.";

        if (string.IsNullOrWhiteSpace(moduleCode))
            yield return "Module code is required.";

        if (string.IsNullOrWhiteSpace(topicName))
            yield return "Topic name is required.";

        if (string.IsNullOrWhiteSpace(recommendationTitle))
            yield return "Recommendation title is required.";

        if (string.IsNullOrWhiteSpace(resourceType))
            yield return "Resource type is required.";

        if (scoreThreshold < 0 || scoreThreshold > 100)
            yield return "Score threshold must be between 0 and 100.";
    }
}
