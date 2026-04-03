using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Application.Mappings;
using GapSense.Domain.Entities;

namespace GapSense.Application.Services;

public sealed class ReadinessResultService : IReadinessResultService
{
    private readonly IReadinessResultRepository _repo;

    public ReadinessResultService(IReadinessResultRepository repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<ReadinessResultResponse>> ListAsync(CancellationToken ct) =>
        (await _repo.ListAsync(ct)).Select(x => x.ToResponse()).ToList();

    public async Task<ReadinessResultResponse?> GetAsync(Guid id, CancellationToken ct) =>
        (await _repo.GetByIdAsync(id, ct))?.ToResponse();

    public async Task<ReadinessResultResponse> CreateAsync(CreateReadinessResultRequest request, CancellationToken ct)
    {
        var entity = new ReadinessResult
        {
            StudentId = request.StudentId.Trim().ToUpperInvariant(),
            ModuleCode = request.ModuleCode.Trim().ToUpperInvariant(),
            Batch = request.Batch.Trim(),
            Semester = request.Semester.Trim(),
            ReadinessScore = request.ReadinessScore,
            Status = request.Status.Trim().ToLowerInvariant(),
            IsActive = true,
        };
        await _repo.AddAsync(entity, ct);
        return entity.ToResponse();
    }

    public async Task<ReadinessResultResponse?> UpdateAsync(Guid id, UpdateReadinessResultRequest request, CancellationToken ct)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        if (entity is null) return null;

        entity.StudentId = request.StudentId.Trim().ToUpperInvariant();
        entity.ModuleCode = request.ModuleCode.Trim().ToUpperInvariant();
        entity.Batch = request.Batch.Trim();
        entity.Semester = request.Semester.Trim();
        entity.ReadinessScore = request.ReadinessScore;
        entity.Status = request.Status.Trim().ToLowerInvariant();
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

