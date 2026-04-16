using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class MonitoringNoteRepository : IMonitoringNoteRepository
{
    private readonly GapSenseDbContext _db;

    public MonitoringNoteRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<MonitoringNote>> ListByStudentProfileIdAsync(Guid studentProfileId, CancellationToken ct) =>
        await _db.MonitoringNotes
            .AsNoTracking()
            .Where(x => x.StudentProfileId == studentProfileId && x.IsActive)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);

    public async Task AddAsync(MonitoringNote entity, CancellationToken ct)
    {
        _db.MonitoringNotes.Add(entity);
        await _db.SaveChangesAsync(ct);
    }
}
