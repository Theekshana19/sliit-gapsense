using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class UpdateLecturerAcademicSettingsRequestValidator : AbstractValidator<UpdateLecturerAcademicSettingsRequest>
{
    public UpdateLecturerAcademicSettingsRequestValidator()
    {
        RuleFor(x => x.Semester).NotEmpty().MaximumLength(64);
        RuleFor(x => x.AcademicYear).NotEmpty().MaximumLength(32);
        RuleFor(x => x.DefaultModule).NotEmpty().MaximumLength(128);
        RuleFor(x => x.AssignedFaculty).NotEmpty().MaximumLength(128);
    }
}
