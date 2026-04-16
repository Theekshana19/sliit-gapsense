namespace GapSense.Application.DTOs.Responses;

public sealed record DashboardMilestoneResponse(
    Guid Id,
    string AvatarInitial,
    string FullName,
    string StudentId,
    string Module,
    int PreviousScore,
    int CurrentScore,
    string StatusLabel,
    string StatusTone
);
