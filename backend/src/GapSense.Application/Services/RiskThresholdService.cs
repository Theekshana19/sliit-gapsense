using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Application.Mappings;
using GapSense.Domain.Entities;

namespace GapSense.Application.Services;

public sealed class RiskThresholdService : IRiskThresholdService
{
    private readonly IRiskThresholdRepository _repo;

    public RiskThresholdService(IRiskThresholdRepository repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<RiskThresholdResponse>> ListAsync(CancellationToken ct)
    {
        var items = await _repo.ListAsync(ct);
        return items.Select(x => x.ToResponse()).ToList();
    }

    public async Task<RiskThresholdResponse?> GetAsync(Guid id, CancellationToken ct)
    {
        var e = await _repo.GetByIdAsync(id, ct);
        return e?.ToResponse();
    }

    public async Task<RiskThresholdResponse> CreateAsync(CreateRiskThresholdRequest request, CancellationToken ct)
    {
        var entity = new RiskThreshold
        {
            ModuleCode = request.ModuleCode.Trim().ToUpperInvariant(),
            Batch = request.Batch.Trim(),
            Semester = request.Semester.Trim(),
            HighRiskBelowPercent = request.HighRiskBelowPercent,
            MediumRiskBelowPercent = request.MediumRiskBelowPercent,
            IsActive = true,
        };

        await _repo.AddAsync(entity, ct);
        return entity.ToResponse();
    }

    public async Task<RiskThresholdResponse?> UpdateAsync(Guid id, UpdateRiskThresholdRequest request, CancellationToken ct)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        if (entity is null)
        {
            return null;
        }

        entity.ModuleCode = request.ModuleCode.Trim().ToUpperInvariant();
        entity.Batch = request.Batch.Trim();
        entity.Semester = request.Semester.Trim();
        entity.HighRiskBelowPercent = request.HighRiskBelowPercent;
        entity.MediumRiskBelowPercent = request.MediumRiskBelowPercent;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repo.UpdateAsync(entity, ct);
        return entity.ToResponse();
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        if (entity is null)
        {
            return false;
        }

        await _repo.DeleteAsync(entity, ct);
        return true;
    }
}

