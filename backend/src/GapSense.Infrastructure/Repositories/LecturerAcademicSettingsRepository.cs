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

    public Task<LecturerAcademicSettings?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _db.LecturerAcademicSettings.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<LecturerAcademicSettings?> GetByIdTrackedAsync(Guid id, CancellationToken ct) =>
        _db.LecturerAcademicSettings.FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<LecturerAcademicSettings?> GetByLecturerProfileIdAsync(Guid lecturerProfileId, CancellationToken ct) =>
        _db.LecturerAcademicSettings.AsNoTracking().FirstOrDefaultAsync(x => x.LecturerProfileId == lecturerProfileId, ct);

    public async Task UpdateAsync(LecturerAcademicSettings entity, CancellationToken ct)
    {
        _db.LecturerAcademicSettings.Update(entity);
        await _db.SaveChangesAsync(ct);
    }
}
