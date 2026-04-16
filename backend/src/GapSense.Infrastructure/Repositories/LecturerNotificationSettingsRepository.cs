using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class LecturerNotificationSettingsRepository : ILecturerNotificationSettingsRepository
{
    private readonly GapSenseDbContext _db;

    public LecturerNotificationSettingsRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public Task<LecturerNotificationSettings?> GetByLecturerIdAsync(Guid lecturerProfileId, CancellationToken ct) =>
        _db.LecturerNotificationSettings.AsNoTracking()
            .FirstOrDefaultAsync(x => x.LecturerProfileId == lecturerProfileId && x.IsActive, ct);

    public async Task AddAsync(LecturerNotificationSettings entity, CancellationToken ct)
    {
        _db.LecturerNotificationSettings.Add(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(LecturerNotificationSettings entity, CancellationToken ct)
    {
        _db.LecturerNotificationSettings.Update(entity);
        await _db.SaveChangesAsync(ct);
    }
}
