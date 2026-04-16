using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class SemesterRepository : ISemesterRepository
{
    private readonly GapSenseDbContext _db;

    public SemesterRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<Semester>> ListActiveOrderedAsync(CancellationToken ct) =>
        await _db.Semesters.AsNoTracking()
            .Where(x => x.IsActive)
            .OrderByDescending(x => x.StartDate)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<Semester>> ListOrderedAsync(CancellationToken ct) =>
        await _db.Semesters.AsNoTracking()
            .OrderByDescending(x => x.StartDate)
            .ToListAsync(ct);

    public Task<Semester?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _db.Semesters.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && x.IsActive, ct);

    public Task<Semester?> GetCurrentAsync(CancellationToken ct) =>
        _db.Semesters.AsNoTracking().FirstOrDefaultAsync(x => x.IsActive && x.IsCurrent, ct);
}
