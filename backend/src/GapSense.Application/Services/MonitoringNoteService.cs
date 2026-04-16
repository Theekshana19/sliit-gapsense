using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Application.Mappings;
using GapSense.Domain.Entities;

namespace GapSense.Application.Services;

public sealed class MonitoringNoteService : IMonitoringNoteService
{
    private readonly IMonitoringNoteRepository _repo;
    private readonly IStudentProfileRepository _students;

    public MonitoringNoteService(IMonitoringNoteRepository repo, IStudentProfileRepository students)
    {
        _repo = repo;
        _students = students;
    }

    public async Task<IReadOnlyList<MonitoringNoteResponse>> ListByStudentAsync(Guid studentProfileId, CancellationToken ct)
    {
        await EnsureStudent(studentProfileId, ct);
        var list = await _repo.ListByStudentProfileIdAsync(studentProfileId, ct);
        return list.Select(x => x.ToNoteResponse()).ToList();
    }

    public async Task<MonitoringNoteResponse> CreateAsync(CreateMonitoringNoteRequest request, CancellationToken ct)
    {
        await EnsureStudent(request.StudentProfileId, ct);
        var entity = new MonitoringNote
        {
            StudentProfileId = request.StudentProfileId,
            NoteType = request.NoteType.Trim(),
            NoteText = request.NoteText.Trim(),
            AddedBy = request.AddedBy.Trim(),
            IsActive = true,
        };
        await _repo.AddAsync(entity, ct);
        return entity.ToNoteResponse();
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
