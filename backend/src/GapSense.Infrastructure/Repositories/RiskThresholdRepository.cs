using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class RiskThresholdRepository : IRiskThresholdRepository
{
    private readonly GapSenseDbContext _db;

    public RiskThresholdRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public Task<RiskThreshold?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _db.RiskThresholds.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<IReadOnlyList<RiskThreshold>> ListAsync(CancellationToken ct)
    {
        var list = await _db.RiskThresholds
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
        return list;
    }

    public async Task AddAsync(RiskThreshold entity, CancellationToken ct)
    {
        _db.RiskThresholds.Add(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(RiskThreshold entity, CancellationToken ct)
    {
        _db.RiskThresholds.Update(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(RiskThreshold entity, CancellationToken ct)
    {
        _db.RiskThresholds.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }
}

