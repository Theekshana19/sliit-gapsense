namespace GapSense.Application.DTOs.Requests;

public sealed record PublishNotificationRequest(
    string Type,
    string SourceKey,
    string Title,
    string Message,
    string? Route);

