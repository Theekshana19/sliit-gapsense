using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class LecturerAcademicSettingsRepository : ILecturerAcademicSettingsRepository
{
    private readonly GapSenseDbContext _db;

    public LecturerAcademicSettingsRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public Task<LecturerAcademicSettings?> GetByLecturerIdAsync(Guid lecturerProfileId, CancellationToken ct) =>
        _db.LecturerAcademicSettings.AsNoTracking()
            .FirstOrDefaultAsync(x => x.LecturerProfileId == lecturerProfileId && x.IsActive, ct);

    public async Task AddAsync(LecturerAcademicSettings entity, CancellationToken ct)
    {
        _db.LecturerAcademicSettings.Add(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(LecturerAcademicSettings entity, CancellationToken ct)
    {
        _db.LecturerAcademicSettings.Update(entity);
        await _db.SaveChangesAsync(ct);
    }
}
