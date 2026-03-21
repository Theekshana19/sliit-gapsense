using GapSense.Application.DTOs;

namespace GapSense.Application.Validation;

public static class RiskThresholdValidator
{
    public static IEnumerable<string> ValidateCreate(CreateRiskThresholdRequest request)
    {
        return ValidateCommon(request.RuleName, request.LowRiskMin, request.MediumRiskMin,
            request.MediumRiskMax, request.HighRiskMax);
    }

    public static IEnumerable<string> ValidateUpdate(UpdateRiskThresholdRequest request)
    {
        return ValidateCommon(request.RuleName, request.LowRiskMin, request.MediumRiskMin,
            request.MediumRiskMax, request.HighRiskMax);
    }

    private static IEnumerable<string> ValidateCommon(string ruleName, int lowRiskMin,
        int mediumRiskMin, int mediumRiskMax, int highRiskMax)
    {
        if (string.IsNullOrWhiteSpace(ruleName))
            yield return "Rule name is required.";

        if (lowRiskMin < 0 || lowRiskMin > 100)
            yield return "Low Risk Min must be between 0 and 100.";

        if (mediumRiskMin < 0 || mediumRiskMin > 100)
            yield return "Medium Risk Min must be between 0 and 100.";

        if (mediumRiskMax < 0 || mediumRiskMax > 100)
            yield return "Medium Risk Max must be between 0 and 100.";

        if (highRiskMax < 0 || highRiskMax > 100)
            yield return "High Risk Max must be between 0 and 100.";

        if (mediumRiskMax <= mediumRiskMin)
            yield return "Medium Risk Max must be greater than Medium Risk Min.";

        if (highRiskMax >= mediumRiskMin)
            yield return "High Risk Max must be less than Medium Risk Min.";

        if (lowRiskMin <= mediumRiskMax)
            yield return "Low Risk Min must be greater than Medium Risk Max.";
    }
}
