using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class UpdateLecturerNotificationSettingsRequestValidator : AbstractValidator<UpdateLecturerNotificationSettingsRequest>
{
    public UpdateLecturerNotificationSettingsRequestValidator()
    {
        RuleFor(x => x).NotNull();
    }
}
