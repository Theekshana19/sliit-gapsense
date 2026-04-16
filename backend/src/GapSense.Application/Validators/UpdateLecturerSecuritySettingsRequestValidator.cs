using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class UpdateLecturerSecuritySettingsRequestValidator : AbstractValidator<UpdateLecturerSecuritySettingsRequest>
{
    public UpdateLecturerSecuritySettingsRequestValidator()
    {
        RuleFor(x => x.SessionTimeoutMinutes).InclusiveBetween(5, 240);

        RuleFor(x => x.NewPassword)
            .MinimumLength(8)
            .When(x => !string.IsNullOrWhiteSpace(x.NewPassword))
            .WithMessage("New password must be at least 8 characters.");

        RuleFor(x => x.CurrentPassword)
            .NotEmpty()
            .When(x => !string.IsNullOrWhiteSpace(x.NewPassword) || !string.IsNullOrWhiteSpace(x.ConfirmPassword))
            .WithMessage("Current password is required to change password.");

        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.NewPassword)
            .When(x => !string.IsNullOrWhiteSpace(x.NewPassword) || !string.IsNullOrWhiteSpace(x.ConfirmPassword))
            .WithMessage("New password and confirmation must match.");
    }
}
