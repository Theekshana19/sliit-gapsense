using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface IMeetingRepository
{
    Task<MeetingOrFollowUp?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<MeetingOrFollowUp?> GetTrackedByIdAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyList<MeetingOrFollowUp>> ListByStudentProfileIdAsync(Guid studentProfileId, CancellationToken ct);
    Task AddAsync(MeetingOrFollowUp entity, CancellationToken ct);
    Task UpdateAsync(MeetingOrFollowUp entity, CancellationToken ct);
}
