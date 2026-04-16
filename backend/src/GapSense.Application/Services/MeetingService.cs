using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Application.Mappings;
using GapSense.Domain.Entities;

namespace GapSense.Application.Services;

public sealed class MeetingService : IMeetingService
{
    private readonly IMeetingRepository _repo;
    private readonly IStudentProfileRepository _students;

    public MeetingService(IMeetingRepository repo, IStudentProfileRepository students)
    {
        _repo = repo;
        _students = students;
    }

    public async Task<IReadOnlyList<MeetingResponse>> ListByStudentAsync(Guid studentProfileId, CancellationToken ct)
    {
        await EnsureStudent(studentProfileId, ct);
        var list = await _repo.ListByStudentProfileIdAsync(studentProfileId, ct);
        return list.Select(x => x.ToMeetingResponse()).ToList();
    }

    public async Task<MeetingResponse?> GetAsync(Guid id, CancellationToken ct)
    {
        var e = await _repo.GetByIdAsync(id, ct);
        return e?.ToMeetingResponse();
    }

    public async Task<MeetingResponse> CreateAsync(CreateMeetingRequest request, CancellationToken ct)
    {
        await EnsureStudent(request.StudentProfileId, ct);
        var when = request.ScheduledDate.Kind == DateTimeKind.Utc
            ? request.ScheduledDate
            : DateTime.SpecifyKind(request.ScheduledDate, DateTimeKind.Utc);
        var entity = new MeetingOrFollowUp
        {
            StudentProfileId = request.StudentProfileId,
            Title = request.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            ScheduledDate = when,
            MeetingType = request.MeetingType.Trim().ToLowerInvariant(),
            Status = request.Status.Trim().ToLowerInvariant(),
            CreatedBy = request.CreatedBy.Trim(),
            IsActive = true,
        };
        await _repo.AddAsync(entity, ct);
        var created = await _repo.GetByIdAsync(entity.Id, ct) ?? entity;
        return created.ToMeetingResponse();
    }

    public async Task<MeetingResponse?> UpdateAsync(Guid id, UpdateMeetingRequest request, CancellationToken ct)
    {
        var entity = await _repo.GetTrackedByIdAsync(id, ct);
        if (entity is null) return null;

        var when = request.ScheduledDate.Kind == DateTimeKind.Utc
            ? request.ScheduledDate
            : DateTime.SpecifyKind(request.ScheduledDate, DateTimeKind.Utc);
        entity.Title = request.Title.Trim();
        entity.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        entity.ScheduledDate = when;
        entity.MeetingType = request.MeetingType.Trim().ToLowerInvariant();
        entity.Status = request.Status.Trim().ToLowerInvariant();
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repo.UpdateAsync(entity, ct);
        var updated = await _repo.GetByIdAsync(id, ct);
        return updated?.ToMeetingResponse();
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
