using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class UpdateInAppNotificationRequestValidator : AbstractValidator<UpdateInAppNotificationRequest>
{
    public UpdateInAppNotificationRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Message).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Type).IsInEnum();
    }
}
