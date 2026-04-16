namespace GapSense.Application.DTOs.Responses;

public sealed record NotificationFeedItemResponse(
    Guid Id,
    string Title,
    string Message,
    string Type,
    string Time,
    bool Read,
    string? Route
);
