namespace GapSense.Application.DTOs.Responses;

public sealed record FollowUpQueueResponse(int Count, string Message, IReadOnlyList<FollowUpTaskResponse> Items);
