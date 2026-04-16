namespace GapSense.Application.DTOs.Requests;

public sealed record UpdateMeetingRequest(
    string Title,
    string? Description,
    DateTime ScheduledDate,
    string MeetingType,
    string Status,
    bool IsActive
);
