using GapSense.Application.DTOs;

namespace GapSense.Application.Services;

public interface IRecommendationRuleService
{
    Task<IReadOnlyList<RecommendationRuleResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<RecommendationRuleResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<RecommendationRuleResponse> CreateAsync(CreateRecommendationRuleRequest request, CancellationToken cancellationToken = default);
    Task<RecommendationRuleResponse?> UpdateAsync(Guid id, UpdateRecommendationRuleRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
