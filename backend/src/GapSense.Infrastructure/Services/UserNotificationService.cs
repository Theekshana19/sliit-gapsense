using System.Linq;
using GapSense.Application.DTOs;
using GapSense.Application.Services;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Services;

public class UserNotificationService : INotificationService
{
    private static readonly string[] AllowedTypes = ["risk", "academic", "reminder", "system"];

    private readonly ApplicationDbContext _db;

    public UserNotificationService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<NotificationResponse>> GetForUserAsync(Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _db.UserNotifications.AsNoTracking()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAtUtc)
            .Select(n => new NotificationResponse(n.Id, n.Title, n.Message, n.Type, n.IsRead, n.CreatedAtUtc))
            .ToListAsync(cancellationToken);
    }

    public async Task MarkReadAsync(Guid userId, Guid notificationId,
        CancellationToken cancellationToken = default)
    {
        var entity = await _db.UserNotifications.FirstOrDefaultAsync(
            n => n.Id == notificationId && n.UserId == userId, cancellationToken);
        if (entity is null)
            throw new InvalidOperationException("Notification not found.");

        entity.IsRead = true;
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkAllReadAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        await _db.UserNotifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true), cancellationToken);
    }

    public async Task DeleteAllForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        await _db.UserNotifications.Where(n => n.UserId == userId)
            .ExecuteDeleteAsync(cancellationToken);
    }

    public async Task CreateAsync(Guid userId, string title, string message, string type,
        CancellationToken cancellationToken = default)
    {
        var t = string.IsNullOrWhiteSpace(type) ? "system" : type.Trim().ToLowerInvariant();
        if (!AllowedTypes.Contains(t))
            t = "system";

        var entity = new UserNotification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title.Trim(),
            Message = message.Trim(),
            Type = t,
            IsRead = false,
            CreatedAtUtc = DateTime.UtcNow
        };
        _db.UserNotifications.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
