using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class UpdateLecturerProfileRequestValidator : AbstractValidator<UpdateLecturerProfileRequest>
{
    public UpdateLecturerProfileRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.PhoneNumber)
            .MaximumLength(32)
            .Matches(@"^[\d\+\-\(\)\s]*$")
            .When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber))
            .WithMessage("Phone number format is invalid.");
        RuleFor(x => x.Department).NotEmpty().MaximumLength(128);
    }
}
