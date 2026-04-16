using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class MeetingRepository : IMeetingRepository
{
    private readonly GapSenseDbContext _db;

    public MeetingRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public Task<MeetingOrFollowUp?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _db.Meetings.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<MeetingOrFollowUp?> GetTrackedByIdAsync(Guid id, CancellationToken ct) =>
        _db.Meetings.FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<IReadOnlyList<MeetingOrFollowUp>> ListByStudentProfileIdAsync(Guid studentProfileId, CancellationToken ct) =>
        await _db.Meetings
            .AsNoTracking()
            .Where(x => x.StudentProfileId == studentProfileId && x.IsActive)
            .OrderByDescending(x => x.ScheduledDate)
            .ToListAsync(ct);

    public async Task AddAsync(MeetingOrFollowUp entity, CancellationToken ct)
    {
        _db.Meetings.Add(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(MeetingOrFollowUp entity, CancellationToken ct)
    {
        _db.Meetings.Update(entity);
        await _db.SaveChangesAsync(ct);
    }
}
