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

    public Task<LecturerSecuritySettings?> GetByLecturerIdAsync(Guid lecturerProfileId, CancellationToken ct) =>
        _db.LecturerSecuritySettings.AsNoTracking()
            .FirstOrDefaultAsync(x => x.LecturerProfileId == lecturerProfileId && x.IsActive, ct);

    public async Task AddAsync(LecturerSecuritySettings entity, CancellationToken ct)
    {
        _db.LecturerSecuritySettings.Add(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(LecturerSecuritySettings entity, CancellationToken ct)
    {
        _db.LecturerSecuritySettings.Update(entity);
        await _db.SaveChangesAsync(ct);
    }
}
