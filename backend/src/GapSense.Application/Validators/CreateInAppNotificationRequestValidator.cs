using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class CreateInAppNotificationRequestValidator : AbstractValidator<CreateInAppNotificationRequest>
{
    public CreateInAppNotificationRequestValidator()
    {
        RuleFor(x => x.LecturerProfileId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Message).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Type).IsInEnum();
    }
}
