using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class BatchReadinessLedgerRequestValidator : AbstractValidator<BatchReadinessLedgerRequest>
{
    public BatchReadinessLedgerRequestValidator()
    {
        Include(new BatchReadinessFilterRequestValidator());
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 50);
    }
}
