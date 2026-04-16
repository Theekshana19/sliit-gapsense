using FluentValidation;
using GapSense.Application.DTOs.Requests;

namespace GapSense.Application.Validators;

public sealed class UpdateMeetingRequestValidator : AbstractValidator<UpdateMeetingRequest>
{
    private static readonly string[] Types = ["consultation", "follow-up", "review", "counseling", "other"];
    private static readonly string[] Statuses = ["scheduled", "completed", "cancelled", "no-show"];

    public UpdateMeetingRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.ScheduledDate).NotEmpty();
        RuleFor(x => x.MeetingType).NotEmpty().Must(v => Types.Contains(v.Trim().ToLowerInvariant()))
            .WithMessage("MeetingType must be consultation, follow-up, review, counseling, or other.");
        RuleFor(x => x.Status).NotEmpty().Must(v => Statuses.Contains(v.Trim().ToLowerInvariant()))
            .WithMessage("Invalid meeting status.");
    }
}
