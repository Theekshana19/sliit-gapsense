using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface IRecommendationRuleRepository
{
    Task<RecommendationRule?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyList<RecommendationRule>> ListAsync(CancellationToken ct);
    Task AddAsync(RecommendationRule entity, CancellationToken ct);
    Task UpdateAsync(RecommendationRule entity, CancellationToken ct);
    Task DeleteAsync(RecommendationRule entity, CancellationToken ct);
}

