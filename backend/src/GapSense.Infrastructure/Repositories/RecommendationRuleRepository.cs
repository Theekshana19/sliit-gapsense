using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class RecommendationRuleRepository : IRecommendationRuleRepository
{
    private readonly GapSenseDbContext _db;

    public RecommendationRuleRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public Task<RecommendationRule?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _db.RecommendationRules.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<IReadOnlyList<RecommendationRule>> ListAsync(CancellationToken ct) =>
        await _db.RecommendationRules.AsNoTracking().OrderByDescending(x => x.CreatedAt).ToListAsync(ct);

    public async Task AddAsync(RecommendationRule entity, CancellationToken ct)
    {
        _db.RecommendationRules.Add(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(RecommendationRule entity, CancellationToken ct)
    {
        _db.RecommendationRules.Update(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(RecommendationRule entity, CancellationToken ct)
    {
        _db.RecommendationRules.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }
}

