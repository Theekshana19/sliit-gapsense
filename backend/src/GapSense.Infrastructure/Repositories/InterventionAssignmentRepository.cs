using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class InterventionAssignmentRepository : IInterventionAssignmentRepository
{
    private readonly GapSenseDbContext _db;

    public InterventionAssignmentRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public Task<InterventionAssignment?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _db.InterventionAssignments.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<InterventionAssignment?> GetTrackedByIdAsync(Guid id, CancellationToken ct) =>
        _db.InterventionAssignments.FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<IReadOnlyList<InterventionAssignment>> ListAllAsync(CancellationToken ct) =>
        await _db.InterventionAssignments
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<InterventionAssignment>> ListByStudentProfileIdAsync(Guid studentProfileId, CancellationToken ct) =>
        await _db.InterventionAssignments
            .AsNoTracking()
            .Where(x => x.StudentProfileId == studentProfileId && x.IsActive)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);

    public async Task<int> CountActivePipelineAsync(CancellationToken ct) =>
        await _db.InterventionAssignments.CountAsync(
            x => x.IsActive && (x.Status == "active" || x.Status == "planned"),
            ct);

    public async Task AddAsync(InterventionAssignment entity, CancellationToken ct)
    {
        _db.InterventionAssignments.Add(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(InterventionAssignment entity, CancellationToken ct)
    {
        _db.InterventionAssignments.Update(entity);
        await _db.SaveChangesAsync(ct);
    }
}
