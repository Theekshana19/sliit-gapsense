using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class ReferralRepository : IReferralRepository
{
    private readonly GapSenseDbContext _db;

    public ReferralRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public Task<ReferralOrEscalation?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _db.Referrals.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<ReferralOrEscalation?> GetTrackedByIdAsync(Guid id, CancellationToken ct) =>
        _db.Referrals.FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<IReadOnlyList<ReferralOrEscalation>> ListByStudentProfileIdAsync(Guid studentProfileId, CancellationToken ct) =>
        await _db.Referrals
            .AsNoTracking()
            .Where(x => x.StudentProfileId == studentProfileId && x.IsActive)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);

    public async Task AddAsync(ReferralOrEscalation entity, CancellationToken ct)
    {
        _db.Referrals.Add(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(ReferralOrEscalation entity, CancellationToken ct)
    {
        _db.Referrals.Update(entity);
        await _db.SaveChangesAsync(ct);
    }
}
