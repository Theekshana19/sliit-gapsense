using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Application.Mappings;
using GapSense.Domain.Entities;

namespace GapSense.Application.Services;

public sealed class ReferralService : IReferralService
{
    private readonly IReferralRepository _repo;
    private readonly IStudentProfileRepository _students;

    public ReferralService(IReferralRepository repo, IStudentProfileRepository students)
    {
        _repo = repo;
        _students = students;
    }

    public async Task<IReadOnlyList<ReferralResponse>> ListByStudentAsync(Guid studentProfileId, CancellationToken ct)
    {
        await EnsureStudent(studentProfileId, ct);
        var list = await _repo.ListByStudentProfileIdAsync(studentProfileId, ct);
        return list.Select(x => x.ToReferralResponse()).ToList();
    }

    public async Task<ReferralResponse?> GetAsync(Guid id, CancellationToken ct)
    {
        var e = await _repo.GetByIdAsync(id, ct);
        return e?.ToReferralResponse();
    }

    public async Task<ReferralResponse> CreateAsync(CreateReferralRequest request, CancellationToken ct)
    {
        await EnsureStudent(request.StudentProfileId, ct);
        var entity = new ReferralOrEscalation
        {
            StudentProfileId = request.StudentProfileId,
            ReferralType = request.ReferralType.Trim().ToLowerInvariant(),
            ReferredTo = request.ReferredTo.Trim(),
            Reason = request.Reason.Trim(),
            Status = request.Status.Trim().ToLowerInvariant(),
            CreatedBy = request.CreatedBy.Trim(),
            IsActive = true,
        };
        await _repo.AddAsync(entity, ct);
        var created = await _repo.GetByIdAsync(entity.Id, ct) ?? entity;
        return created.ToReferralResponse();
    }

    public async Task<ReferralResponse?> UpdateAsync(Guid id, UpdateReferralRequest request, CancellationToken ct)
    {
        var entity = await _repo.GetTrackedByIdAsync(id, ct);
        if (entity is null) return null;

        entity.ReferralType = request.ReferralType.Trim().ToLowerInvariant();
        entity.ReferredTo = request.ReferredTo.Trim();
        entity.Reason = request.Reason.Trim();
        entity.Status = request.Status.Trim().ToLowerInvariant();
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repo.UpdateAsync(entity, ct);
        var updated = await _repo.GetByIdAsync(id, ct);
        return updated?.ToReferralResponse();
    }

    private async Task EnsureStudent(Guid studentProfileId, CancellationToken ct)
    {
        var s = await _students.GetTrackedActiveByIdAsync(studentProfileId, ct);
        if (s is null)
        {
            throw new KeyNotFoundException("Student profile was not found.");
        }
    }
}
