using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class ReadinessResultRepository : IReadinessResultRepository
{
    private readonly GapSenseDbContext _db;

    public ReadinessResultRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public Task<ReadinessResult?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _db.ReadinessResults.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<IReadOnlyList<ReadinessResult>> ListAsync(CancellationToken ct) =>
        await _db.ReadinessResults.AsNoTracking().OrderByDescending(x => x.CreatedAt).ToListAsync(ct);

    public async Task<IReadOnlyList<ReadinessResult>> ListForTrendBySemesterAsync(Guid semesterId, CancellationToken ct) =>
        await _db.ReadinessResults.AsNoTracking()
            .Where(x => x.IsActive && x.SemesterId == semesterId)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync(ct);

    public async Task AddAsync(ReadinessResult entity, CancellationToken ct)
    {
        _db.ReadinessResults.Add(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(ReadinessResult entity, CancellationToken ct)
    {
        _db.ReadinessResults.Update(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(ReadinessResult entity, CancellationToken ct)
    {
        _db.ReadinessResults.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }
}

