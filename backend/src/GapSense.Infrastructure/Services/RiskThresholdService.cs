using GapSense.Application.DTOs;
using GapSense.Application.Services;
using GapSense.Application.Validation;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Services;

public class RiskThresholdService : IRiskThresholdService
{
    private readonly ApplicationDbContext _context;

    public RiskThresholdService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<RiskThresholdResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.RiskThresholds
            .OrderBy(r => r.RuleName)
            .Select(r => MapToResponse(r))
            .ToListAsync(cancellationToken);
    }

    public async Task<RiskThresholdResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.RiskThresholds.FindAsync([id], cancellationToken);
        return entity is null ? null : MapToResponse(entity);
    }

    public async Task<RiskThresholdResponse> CreateAsync(CreateRiskThresholdRequest request, CancellationToken cancellationToken = default)
    {
        var errors = RiskThresholdValidator.ValidateCreate(request).ToList();
        if (errors.Count > 0)
            throw new ArgumentException(string.Join(" ", errors));

        var exists = await _context.RiskThresholds
            .AnyAsync(r => r.RuleName == request.RuleName, cancellationToken);
        if (exists)
            throw new InvalidOperationException($"A threshold with rule name '{request.RuleName}' already exists.");

        var now = DateTime.UtcNow;
        var entity = new RiskThreshold
        {
            Id = Guid.NewGuid(),
            RuleName = request.RuleName.Trim(),
            LowRiskMin = request.LowRiskMin,
            MediumRiskMin = request.MediumRiskMin,
            MediumRiskMax = request.MediumRiskMax,
            HighRiskMax = request.HighRiskMax,
            IsActive = request.IsActive,
            Notes = request.Notes?.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };

        _context.RiskThresholds.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return MapToResponse(entity);
    }

    public async Task<RiskThresholdResponse?> UpdateAsync(Guid id, UpdateRiskThresholdRequest request, CancellationToken cancellationToken = default)
    {
        var errors = RiskThresholdValidator.ValidateUpdate(request).ToList();
        if (errors.Count > 0)
            throw new ArgumentException(string.Join(" ", errors));

        var entity = await _context.RiskThresholds.FindAsync([id], cancellationToken);
        if (entity is null)
            return null;

        var duplicate = await _context.RiskThresholds
            .AnyAsync(r => r.RuleName == request.RuleName.Trim() && r.Id != id, cancellationToken);
        if (duplicate)
            throw new InvalidOperationException($"A threshold with rule name '{request.RuleName}' already exists.");

        entity.RuleName = request.RuleName.Trim();
        entity.LowRiskMin = request.LowRiskMin;
        entity.MediumRiskMin = request.MediumRiskMin;
        entity.MediumRiskMax = request.MediumRiskMax;
        entity.HighRiskMax = request.HighRiskMax;
        entity.IsActive = request.IsActive;
        entity.Notes = request.Notes?.Trim();
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return MapToResponse(entity);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.RiskThresholds.FindAsync([id], cancellationToken);
        if (entity is null)
            return false;

        _context.RiskThresholds.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static RiskThresholdResponse MapToResponse(RiskThreshold entity) =>
        new()
        {
            Id = entity.Id,
            RuleName = entity.RuleName,
            LowRiskMin = entity.LowRiskMin,
            MediumRiskMin = entity.MediumRiskMin,
            MediumRiskMax = entity.MediumRiskMax,
            HighRiskMax = entity.HighRiskMax,
            IsActive = entity.IsActive,
            Notes = entity.Notes,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
}
