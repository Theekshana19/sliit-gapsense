using FluentValidation;
using GapSense.Application.DTOs.Requests;
namespace GapSense.Application.Validators;

public sealed class UpdateFollowUpTaskRequestValidator : AbstractValidator<UpdateFollowUpTaskRequest>
{
    public UpdateFollowUpTaskRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.DueDate).NotEmpty();
        RuleFor(x => x.Status).IsInEnum().WithMessage("Invalid follow-up status.");
        RuleFor(x => x.Priority).IsInEnum().WithMessage("Invalid follow-up priority.");
        RuleFor(x => x.AssignedTo).NotEmpty().MaximumLength(200);
    }
}
