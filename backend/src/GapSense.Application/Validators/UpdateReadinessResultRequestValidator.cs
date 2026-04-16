using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class UpdateReadinessResultRequestValidator : AbstractValidator<UpdateReadinessResultRequest>
{
    public UpdateReadinessResultRequestValidator()
    {
        RuleFor(x => x.StudentId).NotEmpty().MaximumLength(32);
        RuleFor(x => x.ModuleCode).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Batch).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Semester).MaximumLength(32);
        RuleFor(x => x)
            .Must(x => x.SemesterId.HasValue || !string.IsNullOrWhiteSpace(x.Semester))
            .WithMessage("Provide Semester text or SemesterId.");
        RuleFor(x => x.ReadinessScore).InclusiveBetween(0, 100);
        RuleFor(x => x.Status).NotEmpty().MaximumLength(32);
    }
}

