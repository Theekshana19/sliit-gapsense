using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Application.Mappings;
using GapSense.Domain.Entities;

namespace GapSense.Application.Services;

public sealed class InterventionAssignmentService : IInterventionAssignmentService
{
    private readonly IInterventionAssignmentRepository _repo;
    private readonly IStudentProfileRepository _students;

    public InterventionAssignmentService(IInterventionAssignmentRepository repo, IStudentProfileRepository students)
    {
        _repo = repo;
        _students = students;
    }

    public async Task<IReadOnlyList<InterventionAssignmentResponse>> ListAsync(CancellationToken ct)
    {
        var list = await _repo.ListAllAsync(ct);
        return list.Select(x => x.ToInterventionResponse()).ToList();
    }

    public async Task<IReadOnlyList<InterventionAssignmentResponse>> ListByStudentAsync(Guid studentProfileId, CancellationToken ct)
    {
        await EnsureStudentExists(studentProfileId, ct);
        var list = await _repo.ListByStudentProfileIdAsync(studentProfileId, ct);
        return list.Select(x => x.ToInterventionResponse()).ToList();
    }

    public async Task<InterventionAssignmentResponse?> GetAsync(Guid id, CancellationToken ct)
    {
        var e = await _repo.GetByIdAsync(id, ct);
        return e?.ToInterventionResponse();
    }

    public async Task<InterventionAssignmentResponse> CreateAsync(CreateInterventionAssignmentRequest request, CancellationToken ct)
    {
        await EnsureStudentExists(request.StudentProfileId, ct);

        var entity = new InterventionAssignment
        {
            StudentProfileId = request.StudentProfileId,
            AssignedToName = request.AssignedToName.Trim(),
            AssignedToRole = request.AssignedToRole.Trim(),
            InterventionType = request.InterventionType.Trim(),
            Priority = request.Priority.Trim().ToLowerInvariant(),
            Note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim(),
            DueDate = request.DueDate.Kind == DateTimeKind.Utc ? request.DueDate : DateTime.SpecifyKind(request.DueDate, DateTimeKind.Utc),
            FollowUpDate = request.FollowUpDate.HasValue
                ? (request.FollowUpDate.Value.Kind == DateTimeKind.Utc
                    ? request.FollowUpDate
                    : DateTime.SpecifyKind(request.FollowUpDate.Value, DateTimeKind.Utc))
                : null,
            Status = request.Status.Trim().ToLowerInvariant(),
            IsActive = true,
        };
        await _repo.AddAsync(entity, ct);
        var created = await _repo.GetByIdAsync(entity.Id, ct) ?? entity;
        return created.ToInterventionResponse();
    }

    public async Task<InterventionAssignmentResponse?> UpdateAsync(Guid id, UpdateInterventionAssignmentRequest request, CancellationToken ct)
    {
        var entity = await _repo.GetTrackedByIdAsync(id, ct);
        if (entity is null) return null;

        entity.AssignedToName = request.AssignedToName.Trim();
        entity.AssignedToRole = request.AssignedToRole.Trim();
        entity.InterventionType = request.InterventionType.Trim();
        entity.Priority = request.Priority.Trim().ToLowerInvariant();
        entity.Note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim();
        entity.DueDate = request.DueDate.Kind == DateTimeKind.Utc ? request.DueDate : DateTime.SpecifyKind(request.DueDate, DateTimeKind.Utc);
        entity.FollowUpDate = request.FollowUpDate.HasValue
            ? (request.FollowUpDate.Value.Kind == DateTimeKind.Utc
                ? request.FollowUpDate
                : DateTime.SpecifyKind(request.FollowUpDate.Value, DateTimeKind.Utc))
            : null;
        entity.Status = request.Status.Trim().ToLowerInvariant();
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repo.UpdateAsync(entity, ct);
        var updated = await _repo.GetByIdAsync(id, ct);
        return updated?.ToInterventionResponse();
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var entity = await _repo.GetTrackedByIdAsync(id, ct);
        if (entity is null) return false;
        entity.IsActive = false;
        entity.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(entity, ct);
        return true;
    }

    private async Task EnsureStudentExists(Guid studentProfileId, CancellationToken ct)
    {
        var s = await _students.GetTrackedActiveByIdAsync(studentProfileId, ct);
        if (s is null)
        {
            throw new KeyNotFoundException("Student profile was not found.");
        }
    }
}
