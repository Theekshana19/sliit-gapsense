using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class CreateReferralRequestValidator : AbstractValidator<CreateReferralRequest>
{
    private static readonly string[] Types = ["counselor", "academic", "escalation", "welfare", "other"];
    private static readonly string[] Statuses = ["pending", "acknowledged", "in-progress", "closed"];

    public CreateReferralRequestValidator()
    {
        RuleFor(x => x.StudentProfileId).NotEmpty();
        RuleFor(x => x.ReferralType).NotEmpty().Must(v => Types.Contains(v.Trim().ToLowerInvariant()))
            .WithMessage("ReferralType must be counselor, academic, escalation, welfare, or other.");
        RuleFor(x => x.ReferredTo).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Status).NotEmpty().Must(v => Statuses.Contains(v.Trim().ToLowerInvariant()))
            .WithMessage("Invalid referral status.");
        RuleFor(x => x.CreatedBy).NotEmpty().MaximumLength(200);
    }
}
