using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class CreateRiskThresholdRequestValidator : AbstractValidator<CreateRiskThresholdRequest>
{
    public CreateRiskThresholdRequestValidator()
    {
        RuleFor(x => x.ModuleCode)
            .NotEmpty()
            .MaximumLength(32);

        RuleFor(x => x.Batch)
            .NotEmpty()
            .MaximumLength(64);

        RuleFor(x => x.Semester)
            .NotEmpty()
            .MaximumLength(32);

        RuleFor(x => x.HighRiskBelowPercent)
            .InclusiveBetween(0, 100);

        RuleFor(x => x.MediumRiskBelowPercent)
            .InclusiveBetween(0, 100)
            .GreaterThan(x => x.HighRiskBelowPercent);
    }
}

