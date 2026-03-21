using GapSense.Application.DTOs;
using GapSense.Application.Services;
using GapSense.Application.Validation;
using GapSense.Domain.Entities;
using GapSense.Domain.Enums;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Services;

public class RecommendationRuleService : IRecommendationRuleService
{
    private readonly ApplicationDbContext _context;

    public RecommendationRuleService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<RecommendationRuleResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.RecommendationRules
            .OrderBy(r => r.RuleName)
            .Select(r => MapToResponse(r))
            .ToListAsync(cancellationToken);
    }

    public async Task<RecommendationRuleResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.RecommendationRules.FindAsync([id], cancellationToken);
        return entity is null ? null : MapToResponse(entity);
    }

    public async Task<RecommendationRuleResponse> CreateAsync(CreateRecommendationRuleRequest request, CancellationToken cancellationToken = default)
    {
        var errors = RecommendationRuleValidator.ValidateCreate(request).ToList();
        if (errors.Count > 0)
            throw new ArgumentException(string.Join(" ", errors));

        var moduleCode = request.ModuleCode.Trim();
        var topicName = request.TopicName.Trim();

        var exists = await _context.RecommendationRules
            .AnyAsync(
                r => r.ModuleCode == moduleCode
                    && r.TopicName == topicName
                    && r.ConditionType == request.ConditionType
                    && r.ScoreThreshold == request.ScoreThreshold,
                cancellationToken);
        if (exists)
            throw new InvalidOperationException(
                "A recommendation rule with the same module, topic, condition type, and score threshold already exists.");

        var now = DateTime.UtcNow;
        var entity = new RecommendationRule
        {
            Id = Guid.NewGuid(),
            RuleName = request.RuleName.Trim(),
            ModuleCode = moduleCode,
            ModuleName = request.ModuleName.Trim(),
            TopicName = topicName,
            ConditionType = request.ConditionType,
            ScoreThreshold = request.ScoreThreshold,
            RecommendationTitle = request.RecommendationTitle.Trim(),
            ResourceType = request.ResourceType.Trim(),
            PriorityLevel = request.PriorityLevel,
            ResourceUrl = request.ResourceUrl?.Trim(),
            AttachmentPath = request.AttachmentPath?.Trim(),
            AdministrativeRationale = request.AdministrativeRationale?.Trim(),
            Status = request.Status,
            CreatedAt = now,
            UpdatedAt = now
        };

        _context.RecommendationRules.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return MapToResponse(entity);
    }

    public async Task<RecommendationRuleResponse?> UpdateAsync(Guid id, UpdateRecommendationRuleRequest request, CancellationToken cancellationToken = default)
    {
        var errors = RecommendationRuleValidator.ValidateUpdate(request).ToList();
        if (errors.Count > 0)
            throw new ArgumentException(string.Join(" ", errors));

        var entity = await _context.RecommendationRules.FindAsync([id], cancellationToken);
        if (entity is null)
            return null;

        var moduleCode = request.ModuleCode.Trim();
        var topicName = request.TopicName.Trim();

        var duplicate = await _context.RecommendationRules
            .AnyAsync(
                r => r.Id != id
                    && r.ModuleCode == moduleCode
                    && r.TopicName == topicName
                    && r.ConditionType == request.ConditionType
                    && r.ScoreThreshold == request.ScoreThreshold,
                cancellationToken);
        if (duplicate)
            throw new InvalidOperationException(
                "A recommendation rule with the same module, topic, condition type, and score threshold already exists.");

        entity.RuleName = request.RuleName.Trim();
        entity.ModuleCode = moduleCode;
        entity.ModuleName = request.ModuleName.Trim();
        entity.TopicName = topicName;
        entity.ConditionType = request.ConditionType;
        entity.ScoreThreshold = request.ScoreThreshold;
        entity.RecommendationTitle = request.RecommendationTitle.Trim();
        entity.ResourceType = request.ResourceType.Trim();
        entity.PriorityLevel = request.PriorityLevel;
        entity.ResourceUrl = request.ResourceUrl?.Trim();
        entity.AttachmentPath = request.AttachmentPath?.Trim();
        entity.AdministrativeRationale = request.AdministrativeRationale?.Trim();
        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return MapToResponse(entity);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.RecommendationRules.FindAsync([id], cancellationToken);
        if (entity is null)
            return false;

        _context.RecommendationRules.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static RecommendationRuleResponse MapToResponse(RecommendationRule entity) =>
        new()
        {
            Id = entity.Id,
            RuleName = entity.RuleName,
            ModuleCode = entity.ModuleCode,
            ModuleName = entity.ModuleName,
            TopicName = entity.TopicName,
            ConditionType = entity.ConditionType,
            ScoreThreshold = entity.ScoreThreshold,
            RecommendationTitle = entity.RecommendationTitle,
            ResourceType = entity.ResourceType,
            PriorityLevel = entity.PriorityLevel,
            ResourceUrl = entity.ResourceUrl,
            AttachmentPath = entity.AttachmentPath,
            AdministrativeRationale = entity.AdministrativeRationale,
            Status = entity.Status,
            IsActive = entity.Status == RecommendationRuleStatus.Active,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
}
