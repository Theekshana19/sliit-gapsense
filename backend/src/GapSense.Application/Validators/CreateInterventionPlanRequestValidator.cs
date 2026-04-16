using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class CreateInterventionPlanRequestValidator : AbstractValidator<CreateInterventionPlanRequest>
{
    private static readonly string[] RiskGroups = ["high", "medium", "low"];
    private static readonly string[] Statuses = ["planned", "active", "completed"];
    private static readonly string[] Types =
    [
        "extra-support", "learning-resource", "remedial", "mentoring", "workshop", "tutorial", "group-discussion",
    ];

    public CreateInterventionPlanRequestValidator()
    {
        RuleFor(x => x.ModuleCode).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Batch).NotEmpty().MaximumLength(64);
        RuleFor(x => x.RiskGroup).NotEmpty().Must(v => RiskGroups.Contains(v.Trim().ToLowerInvariant()))
            .WithMessage("RiskGroup must be high, medium, or low.");
        RuleFor(x => x.InterventionType).NotEmpty().Must(v => Types.Contains(v.Trim().ToLowerInvariant()))
            .WithMessage("InterventionType is not a supported value.");
        RuleFor(x => x.PlannedDate).Must(d => d != default).WithMessage("PlannedDate is required.");
        RuleFor(x => x.Status).NotEmpty().Must(v => Statuses.Contains(v.Trim().ToLowerInvariant()))
            .WithMessage("Status must be planned, active, or completed.");
        RuleFor(x => x.AssignedLecturer).MaximumLength(200);
        RuleFor(x => x.Notes).MaximumLength(2000);

        When(x => !x.IsDraft, () =>
        {
            RuleFor(x => x.WeakTopic).NotEmpty().MinimumLength(3).MaximumLength(200);
            RuleFor(x => x.Notes).NotEmpty().MinimumLength(10).MaximumLength(2000);
        });

        When(x => x.IsDraft, () =>
        {
            RuleFor(x => x.WeakTopic).MaximumLength(200);
            RuleFor(x => x.Notes).MaximumLength(2000);
        });
    }
}
