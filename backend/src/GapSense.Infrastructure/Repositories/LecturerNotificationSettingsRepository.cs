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

    public Task<LecturerNotificationSettings?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _db.LecturerNotificationSettings.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<LecturerNotificationSettings?> GetByIdTrackedAsync(Guid id, CancellationToken ct) =>
        _db.LecturerNotificationSettings.FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<LecturerNotificationSettings?> GetByLecturerProfileIdAsync(Guid lecturerProfileId, CancellationToken ct) =>
        _db.LecturerNotificationSettings.AsNoTracking().FirstOrDefaultAsync(x => x.LecturerProfileId == lecturerProfileId, ct);

    public async Task UpdateAsync(LecturerNotificationSettings entity, CancellationToken ct)
    {
        _db.LecturerNotificationSettings.Update(entity);
        await _db.SaveChangesAsync(ct);
    }
}
