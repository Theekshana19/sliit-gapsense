using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class InterventionPlansSearchRequestValidator : AbstractValidator<InterventionPlansSearchRequest>
{
    public InterventionPlansSearchRequestValidator()
    {
        RuleFor(x => x.Query).MaximumLength(200).When(x => x.Query is not null);
    }
}
