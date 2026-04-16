using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class GenerateReportRequestValidator : AbstractValidator<GenerateReportRequest>
{
    public GenerateReportRequestValidator()
    {
        RuleFor(x => x.ReportType)
            .NotEmpty()
            .Must(v => v is "readiness" or "module_risk" or "weak_topic")
            .WithMessage("Invalid report type.");

        RuleFor(x => x.Format)
            .NotEmpty()
            .Must(v => v is "pdf" or "csv")
            .WithMessage("Invalid export format.");

        RuleFor(x => x.SemesterId).NotEmpty();
        RuleFor(x => x.Batch).NotEmpty().MaximumLength(64);
    }
}
