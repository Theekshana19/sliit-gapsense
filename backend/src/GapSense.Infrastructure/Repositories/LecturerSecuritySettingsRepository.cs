using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class LecturerSecuritySettingsRepository : ILecturerSecuritySettingsRepository
{
    private readonly GapSenseDbContext _db;

    public LecturerSecuritySettingsRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public Task<LecturerSecuritySettings?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _db.LecturerSecuritySettings.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<LecturerSecuritySettings?> GetByIdTrackedAsync(Guid id, CancellationToken ct) =>
        _db.LecturerSecuritySettings.FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<LecturerSecuritySettings?> GetByLecturerProfileIdAsync(Guid lecturerProfileId, CancellationToken ct) =>
        _db.LecturerSecuritySettings.AsNoTracking().FirstOrDefaultAsync(x => x.LecturerProfileId == lecturerProfileId, ct);

    public async Task UpdateAsync(LecturerSecuritySettings entity, CancellationToken ct)
    {
        _db.LecturerSecuritySettings.Update(entity);
        await _db.SaveChangesAsync(ct);
    }
}
