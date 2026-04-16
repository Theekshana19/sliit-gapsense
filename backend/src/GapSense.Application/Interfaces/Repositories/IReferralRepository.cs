using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface IReferralRepository
{
    Task<ReferralOrEscalation?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<ReferralOrEscalation?> GetTrackedByIdAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyList<ReferralOrEscalation>> ListByStudentProfileIdAsync(Guid studentProfileId, CancellationToken ct);
    Task AddAsync(ReferralOrEscalation entity, CancellationToken ct);
    Task UpdateAsync(ReferralOrEscalation entity, CancellationToken ct);
}
