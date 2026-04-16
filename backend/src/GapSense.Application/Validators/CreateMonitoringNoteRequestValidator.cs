using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class CreateMonitoringNoteRequestValidator : AbstractValidator<CreateMonitoringNoteRequest>
{
    public CreateMonitoringNoteRequestValidator()
    {
        RuleFor(x => x.StudentProfileId).NotEmpty();
        RuleFor(x => x.NoteType).NotEmpty().MaximumLength(64);
        RuleFor(x => x.NoteText).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.AddedBy).NotEmpty().MaximumLength(200);
    }
}
