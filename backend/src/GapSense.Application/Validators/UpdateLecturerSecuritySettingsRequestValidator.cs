using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class UpdateLecturerSecuritySettingsRequestValidator : AbstractValidator<UpdateLecturerSecuritySettingsRequest>
{
    public UpdateLecturerSecuritySettingsRequestValidator()
    {
        RuleFor(x => x.NewPassword)
            .MinimumLength(8)
            .When(x => !string.IsNullOrWhiteSpace(x.NewPassword))
            .WithMessage("Password must be at least 8 characters when provided.");
    }
}
