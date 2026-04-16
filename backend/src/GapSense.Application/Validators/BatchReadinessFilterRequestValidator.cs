using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class BatchReadinessFilterRequestValidator : AbstractValidator<BatchReadinessFilterRequest>
{
    public BatchReadinessFilterRequestValidator()
    {
        RuleFor(x => x.SemesterId).NotEmpty();
        RuleFor(x => x.IntakeBatch).MaximumLength(64).When(x => x.IntakeBatch is not null);
    }
}
