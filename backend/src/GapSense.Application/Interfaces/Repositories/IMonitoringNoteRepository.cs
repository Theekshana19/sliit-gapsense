using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface IMonitoringNoteRepository
{
    Task<IReadOnlyList<MonitoringNote>> ListByStudentProfileIdAsync(Guid studentProfileId, CancellationToken ct);
    Task AddAsync(MonitoringNote entity, CancellationToken ct);
}
