using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface IFollowUpTaskService
{
    Task<FollowUpQueueResponse> GetQueueAsync(Guid semesterId, CancellationToken ct);
    Task<FollowUpManagementResponse> GetManagementAsync(
        Guid semesterId,
        string? search,
        string? module,
        string? status,
        CancellationToken ct);
    Task<IReadOnlyList<FollowUpTaskResponse>> ListByStudentAsync(Guid studentProfileId, CancellationToken ct);
    Task<FollowUpTaskResponse> CreateAsync(CreateFollowUpTaskRequest request, CancellationToken ct);
    Task<FollowUpTaskResponse?> UpdateAsync(Guid id, UpdateFollowUpTaskRequest request, CancellationToken ct);
    Task<FollowUpTaskResponse?> MarkCompletedAsync(Guid id, CancellationToken ct);
    Task<int> RemindAllAsync(Guid semesterId, CancellationToken ct);
    Task<bool> DismissAsync(Guid id, CancellationToken ct);
    Task<int> DismissQueueAsync(Guid semesterId, CancellationToken ct);
}
