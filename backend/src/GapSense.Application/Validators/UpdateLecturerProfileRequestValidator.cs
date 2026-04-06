using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class UpdateLecturerProfileRequestValidator : AbstractValidator<UpdateLecturerProfileRequest>
{
    public UpdateLecturerProfileRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Department).NotEmpty().MaximumLength(200);
    }
}
