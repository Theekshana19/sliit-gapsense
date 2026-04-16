using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class CreateInterventionAssignmentRequestValidator : AbstractValidator<CreateInterventionAssignmentRequest>
{
    private static readonly string[] Statuses = ["planned", "active", "completed", "reviewed", "escalated", "cancelled"];
    private static readonly string[] Priorities = ["low", "medium", "high", "urgent"];

    public CreateInterventionAssignmentRequestValidator()
    {
        RuleFor(x => x.StudentProfileId).NotEmpty();
        RuleFor(x => x.AssignedToName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.AssignedToRole).NotEmpty().MaximumLength(64);
        RuleFor(x => x.InterventionType).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Priority).NotEmpty().Must(v => Priorities.Contains(v.Trim().ToLowerInvariant()))
            .WithMessage("Priority must be low, medium, high, or urgent.");
        RuleFor(x => x.Note).MaximumLength(2000);
        RuleFor(x => x.DueDate).NotEmpty();
        RuleFor(x => x.Status).NotEmpty().Must(v => Statuses.Contains(v.Trim().ToLowerInvariant()))
            .WithMessage("Invalid status.");
        RuleFor(x => x)
            .Must(x => !x.FollowUpDate.HasValue || x.FollowUpDate.Value >= x.DueDate)
            .WithMessage("Follow-up date must be on or after the due date.");
    }
}
