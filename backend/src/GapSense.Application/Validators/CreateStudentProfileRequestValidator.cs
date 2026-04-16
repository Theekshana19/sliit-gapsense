using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class CreateStudentProfileRequestValidator : AbstractValidator<CreateStudentProfileRequest>
{
    private static readonly string[] RiskLevels = ["critical", "moderate", "low"];

    public CreateStudentProfileRequestValidator()
    {
        RuleFor(x => x.StudentId).NotEmpty().MaximumLength(32);
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Phone).MaximumLength(32);
        RuleFor(x => x.Batch).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Year).InclusiveBetween(1, 10);
        RuleFor(x => x.SemesterId).NotEmpty();
        RuleFor(x => x.DegreeProgram).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Gpa).InclusiveBetween(0, 4);
        RuleFor(x => x.AttendancePercentage).InclusiveBetween(0, 100);
        RuleFor(x => x.RecentAssessmentScore).InclusiveBetween(0, 100);
        RuleFor(x => x.ReadinessScore).InclusiveBetween(0, 100);
        RuleFor(x => x.RiskScore).InclusiveBetween(0, 100);
        RuleFor(x => x.RiskLevel).NotEmpty().Must(v => RiskLevels.Contains(v.Trim().ToLowerInvariant()))
            .WithMessage("RiskLevel must be critical, moderate, or low.");
        RuleFor(x => x.PerformanceTrend).NotEmpty().MaximumLength(64);
        RuleFor(x => x.CurrentModule).NotEmpty().MaximumLength(200);
    }
}
