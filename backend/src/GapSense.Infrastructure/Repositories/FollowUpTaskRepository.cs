using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Domain.Enums;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class FollowUpTaskRepository : IFollowUpTaskRepository
{
    private readonly GapSenseDbContext _db;

    public FollowUpTaskRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public Task<FollowUpTask?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _db.FollowUpTasks
            .AsNoTracking()
            .Include(x => x.StudentProfile)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<FollowUpTask?> GetTrackedByIdAsync(Guid id, CancellationToken ct) =>
        _db.FollowUpTasks
            .Include(x => x.StudentProfile)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<IReadOnlyList<FollowUpTask>> ListQueueForSemesterAsync(Guid semesterId, CancellationToken ct) =>
        await _db.FollowUpTasks
            .AsNoTracking()
            .Include(x => x.StudentProfile)
            .Where(x => x.IsActive
                        && !x.IsDismissed
                        && x.Status == FollowUpStatus.Pending
                        && x.StudentProfile != null
                        && x.StudentProfile.SemesterId == semesterId)
            .OrderBy(x => x.DueDate)
            .ThenBy(x => x.CreatedAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<FollowUpTask>> ListForSemesterAsync(Guid semesterId, CancellationToken ct) =>
        await _db.FollowUpTasks
            .AsNoTracking()
            .Include(x => x.StudentProfile)
            .Where(x => x.IsActive
                        && !x.IsDismissed
                        && x.StudentProfile != null
                        && x.StudentProfile.SemesterId == semesterId)
            .OrderBy(x => x.DueDate)
            .ThenByDescending(x => x.CreatedAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<FollowUpTask>> ListByStudentProfileIdAsync(Guid studentProfileId, CancellationToken ct) =>
        await _db.FollowUpTasks
            .AsNoTracking()
            .Include(x => x.StudentProfile)
            .Where(x => x.StudentProfileId == studentProfileId && x.IsActive)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);

    public async Task<int> RemindAllPendingForSemesterAsync(Guid semesterId, CancellationToken ct)
    {
        var studentIds = await _db.StudentProfiles
            .AsNoTracking()
            .Where(s => s.SemesterId == semesterId)
            .Select(s => s.Id)
            .ToListAsync(ct);

        if (studentIds.Count == 0)
        {
            return 0;
        }

        var now = DateTime.UtcNow;
        return await _db.FollowUpTasks
            .Where(x => x.IsActive
                        && !x.IsDismissed
                        && x.Status == FollowUpStatus.Pending
                        && studentIds.Contains(x.StudentProfileId))
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(x => x.ReminderSentAt, _ => now)
                    .SetProperty(x => x.UpdatedAt, _ => now),
                ct);
    }

    public async Task<int> DismissAllPendingForSemesterAsync(Guid semesterId, CancellationToken ct)
    {
        var studentIds = await _db.StudentProfiles
            .AsNoTracking()
            .Where(s => s.SemesterId == semesterId)
            .Select(s => s.Id)
            .ToListAsync(ct);

        if (studentIds.Count == 0)
        {
            return 0;
        }

        var now = DateTime.UtcNow;
        return await _db.FollowUpTasks
            .Where(x => x.IsActive
                        && !x.IsDismissed
                        && x.Status == FollowUpStatus.Pending
                        && studentIds.Contains(x.StudentProfileId))
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(x => x.IsDismissed, _ => true)
                    .SetProperty(x => x.UpdatedAt, _ => now),
                ct);
    }

    public async Task AddAsync(FollowUpTask entity, CancellationToken ct)
    {
        _db.FollowUpTasks.Add(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(FollowUpTask entity, CancellationToken ct)
    {
        _db.FollowUpTasks.Update(entity);
        await _db.SaveChangesAsync(ct);
    }
}
