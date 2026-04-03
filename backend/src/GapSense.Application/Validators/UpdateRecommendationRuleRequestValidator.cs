using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class UpdateRecommendationRuleRequestValidator : AbstractValidator<UpdateRecommendationRuleRequest>
{
    public UpdateRecommendationRuleRequestValidator()
    {
        RuleFor(x => x.RuleName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.RiskLevel).NotEmpty().MaximumLength(16);
        RuleFor(x => x.ResourceType).NotEmpty().MaximumLength(64);
        RuleFor(x => x.ActionText).NotEmpty().MaximumLength(500);
    }
}

