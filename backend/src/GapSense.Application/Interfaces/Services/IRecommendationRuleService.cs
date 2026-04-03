using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface IRecommendationRuleService
{
    Task<IReadOnlyList<RecommendationRuleResponse>> ListAsync(CancellationToken ct);
    Task<RecommendationRuleResponse?> GetAsync(Guid id, CancellationToken ct);
    Task<RecommendationRuleResponse> CreateAsync(CreateRecommendationRuleRequest request, CancellationToken ct);
    Task<RecommendationRuleResponse?> UpdateAsync(Guid id, UpdateRecommendationRuleRequest request, CancellationToken ct);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct);
}

