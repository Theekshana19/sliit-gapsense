using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Application.Mappings;
using GapSense.Domain.Entities;

namespace GapSense.Application.Services;

public sealed class RecommendationRuleService : IRecommendationRuleService
{
    private readonly IRecommendationRuleRepository _repo;

    public RecommendationRuleService(IRecommendationRuleRepository repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<RecommendationRuleResponse>> ListAsync(CancellationToken ct) =>
        (await _repo.ListAsync(ct)).Select(x => x.ToResponse()).ToList();

    public async Task<RecommendationRuleResponse?> GetAsync(Guid id, CancellationToken ct) =>
        (await _repo.GetByIdAsync(id, ct))?.ToResponse();

    public async Task<RecommendationRuleResponse> CreateAsync(CreateRecommendationRuleRequest request, CancellationToken ct)
    {
        var entity = new RecommendationRule
        {
            RuleName = request.RuleName.Trim(),
            RiskLevel = request.RiskLevel.Trim().ToLowerInvariant(),
            ResourceType = request.ResourceType.Trim(),
            ActionText = request.ActionText.Trim(),
            IsActive = true,
        };
        await _repo.AddAsync(entity, ct);
        return entity.ToResponse();
    }

    public async Task<RecommendationRuleResponse?> UpdateAsync(Guid id, UpdateRecommendationRuleRequest request, CancellationToken ct)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        if (entity is null) return null;

        entity.RuleName = request.RuleName.Trim();
        entity.RiskLevel = request.RiskLevel.Trim().ToLowerInvariant();
        entity.ResourceType = request.ResourceType.Trim();
        entity.ActionText = request.ActionText.Trim();
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repo.UpdateAsync(entity, ct);
        return entity.ToResponse();
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        if (entity is null) return false;
        await _repo.DeleteAsync(entity, ct);
        return true;
    }
}

