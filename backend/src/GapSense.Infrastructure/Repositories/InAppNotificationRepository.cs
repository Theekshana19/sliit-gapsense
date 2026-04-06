using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Domain.Enums;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class InAppNotificationRepository : IInAppNotificationRepository
{
    private readonly GapSenseDbContext _db;

    public InAppNotificationRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public Task<InAppNotification?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _db.InAppNotifications.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<InAppNotification?> GetByIdTrackedAsync(Guid id, CancellationToken ct) =>
        _db.InAppNotifications.FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<IReadOnlyList<InAppNotification>> ListByLecturerAsync(Guid lecturerProfileId, NotificationKind? type, CancellationToken ct)
    {
        IQueryable<InAppNotification> q = _db.InAppNotifications.AsNoTracking()
            .Where(x => x.LecturerProfileId == lecturerProfileId && x.IsActive);
        if (type is not null)
        {
            var t = type.Value;
            q = q.Where(x => x.Type == t);
        }

        var list = await q.OrderByDescending(x => x.CreatedAt).ToListAsync(ct);
        return list;
    }

    public Task<int> CountUnreadAsync(Guid lecturerProfileId, CancellationToken ct) =>
        _db.InAppNotifications.AsNoTracking()
            .CountAsync(x => x.LecturerProfileId == lecturerProfileId && x.IsActive && !x.IsRead, ct);

    public async Task AddAsync(InAppNotification entity, CancellationToken ct)
    {
        _db.InAppNotifications.Add(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(InAppNotification entity, CancellationToken ct)
    {
        _db.InAppNotifications.Update(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(InAppNotification entity, CancellationToken ct)
    {
        _db.InAppNotifications.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    public Task MarkAllReadAsync(Guid lecturerProfileId, CancellationToken ct) =>
        _db.InAppNotifications
            .Where(x => x.LecturerProfileId == lecturerProfileId && !x.IsRead)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.IsRead, true)
                .SetProperty(x => x.UpdatedAt, DateTime.UtcNow), ct);

    public Task DeleteAllForLecturerAsync(Guid lecturerProfileId, CancellationToken ct) =>
        _db.InAppNotifications.Where(x => x.LecturerProfileId == lecturerProfileId).ExecuteDeleteAsync(ct);
}
