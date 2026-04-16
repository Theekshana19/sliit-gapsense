namespace GapSense.Application.DTOs.Requests;

public sealed record CreateMeetingRequest(
    Guid StudentProfileId,
    string Title,
    string? Description,
    DateTime ScheduledDate,
    string MeetingType,
    string Status,
    string CreatedBy
);
