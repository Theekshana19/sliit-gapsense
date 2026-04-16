using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class InterventionPlanRepository : IInterventionPlanRepository
{
    private readonly GapSenseDbContext _db;

    public InterventionPlanRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<InterventionPlan>> ListActiveAsync(CancellationToken ct) =>
        await _db.InterventionPlans.AsNoTracking()
            .Where(x => x.IsActive)
            .Include(x => x.Reviews)
            .OrderByDescending(x => x.PlannedDate)
            .ThenByDescending(x => x.CreatedAt)
            .ToListAsync(ct);

    public Task<InterventionPlan?> GetActiveByIdAsync(Guid id, CancellationToken ct) =>
        _db.InterventionPlans.AsNoTracking()
            .Include(x => x.Reviews)
            .FirstOrDefaultAsync(x => x.Id == id && x.IsActive, ct);

    public Task<InterventionPlan?> GetTrackedByIdAsync(Guid id, CancellationToken ct) =>
        _db.InterventionPlans.FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task AddAsync(InterventionPlan entity, CancellationToken ct)
    {
        _db.InterventionPlans.Add(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(InterventionPlan entity, CancellationToken ct)
    {
        _db.InterventionPlans.Update(entity);
        await _db.SaveChangesAsync(ct);
    }
}
