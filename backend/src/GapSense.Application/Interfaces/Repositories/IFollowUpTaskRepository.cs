using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface IFollowUpTaskRepository
{
    Task<FollowUpTask?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<FollowUpTask?> GetTrackedByIdAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyList<FollowUpTask>> ListQueueForSemesterAsync(Guid semesterId, CancellationToken ct);
    Task<IReadOnlyList<FollowUpTask>> ListForSemesterAsync(Guid semesterId, CancellationToken ct);
    Task<IReadOnlyList<FollowUpTask>> ListByStudentProfileIdAsync(Guid studentProfileId, CancellationToken ct);
    Task<int> RemindAllPendingForSemesterAsync(Guid semesterId, CancellationToken ct);
    Task<int> DismissAllPendingForSemesterAsync(Guid semesterId, CancellationToken ct);
    Task AddAsync(FollowUpTask entity, CancellationToken ct);
    Task UpdateAsync(FollowUpTask entity, CancellationToken ct);
}
