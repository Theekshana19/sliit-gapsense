using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class NotificationFeedRepository : INotificationFeedRepository
{
    private readonly GapSenseDbContext _db;

    public NotificationFeedRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public Task<NotificationFeedItem?> GetBySourceAsync(Guid lecturerProfileId, string sourceType, string sourceKey, CancellationToken ct) =>
        _db.NotificationFeedItems.FirstOrDefaultAsync(
            x => x.LecturerProfileId == lecturerProfileId && x.SourceType == sourceType && x.SourceKey == sourceKey, ct);

    public async Task<IReadOnlyList<NotificationFeedItem>> GetRecentAsync(Guid lecturerProfileId, int take, CancellationToken ct) =>
        await _db.NotificationFeedItems.AsNoTracking()
            .Where(x => x.LecturerProfileId == lecturerProfileId && x.IsActive)
            .OrderByDescending(x => x.CreatedAt)
            .Take(Math.Clamp(take, 1, 100))
            .ToListAsync(ct);

    public Task<int> GetUnreadCountAsync(Guid lecturerProfileId, CancellationToken ct) =>
        _db.NotificationFeedItems.AsNoTracking()
            .CountAsync(x => x.LecturerProfileId == lecturerProfileId && x.IsActive && x.ReadAtUtc == null, ct);

    public Task<NotificationFeedItem?> GetByIdAsync(Guid lecturerProfileId, Guid id, CancellationToken ct) =>
        _db.NotificationFeedItems.FirstOrDefaultAsync(
            x => x.LecturerProfileId == lecturerProfileId && x.Id == id && x.IsActive, ct);

    public async Task AddAsync(NotificationFeedItem entity, CancellationToken ct)
    {
        _db.NotificationFeedItems.Add(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(NotificationFeedItem entity, CancellationToken ct)
    {
        _db.NotificationFeedItems.Update(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task MarkAllReadAsync(Guid lecturerProfileId, CancellationToken ct)
    {
        var items = await _db.NotificationFeedItems
            .Where(x => x.LecturerProfileId == lecturerProfileId && x.IsActive && x.ReadAtUtc == null)
            .ToListAsync(ct);
        var now = DateTime.UtcNow;
        foreach (var item in items)
        {
            item.ReadAtUtc = now;
            item.UpdatedAt = now;
        }
        await _db.SaveChangesAsync(ct);
    }

    public async Task ClearAllAsync(Guid lecturerProfileId, CancellationToken ct)
    {
        var items = await _db.NotificationFeedItems
            .Where(x => x.LecturerProfileId == lecturerProfileId && x.IsActive)
            .ToListAsync(ct);
        var now = DateTime.UtcNow;
        foreach (var item in items)
        {
            item.IsActive = false;
            item.UpdatedAt = now;
        }
        await _db.SaveChangesAsync(ct);
    }
}
