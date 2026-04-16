using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class LecturerProfileRepository : ILecturerProfileRepository
{
    private readonly GapSenseDbContext _db;

    public LecturerProfileRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public Task<LecturerProfile?> GetDefaultActiveAsync(CancellationToken ct) =>
        _db.LecturerProfiles.AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.CreatedAt)
            .FirstOrDefaultAsync(ct);

    public async Task AddAsync(LecturerProfile entity, CancellationToken ct)
    {
        _db.LecturerProfiles.Add(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(LecturerProfile entity, CancellationToken ct)
    {
        _db.LecturerProfiles.Update(entity);
        await _db.SaveChangesAsync(ct);
    }
}
