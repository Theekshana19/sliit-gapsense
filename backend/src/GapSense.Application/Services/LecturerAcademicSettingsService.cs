using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Application.Mappings;

namespace GapSense.Application.Services;

public sealed class LecturerAcademicSettingsService : ILecturerAcademicSettingsService
{
    private readonly ILecturerAcademicSettingsRepository _repo;

    public LecturerAcademicSettingsService(ILecturerAcademicSettingsRepository repo)
    {
        _repo = repo;
    }

    public async Task<LecturerAcademicSettingsResponse?> GetAsync(Guid id, CancellationToken ct)
    {
        var e = await _repo.GetByIdAsync(id, ct);
        return e?.ToResponse();
    }

    public async Task<LecturerAcademicSettingsResponse?> GetByLecturerAsync(Guid lecturerProfileId, CancellationToken ct)
    {
        var e = await _repo.GetByLecturerProfileIdAsync(lecturerProfileId, ct);
        return e?.ToResponse();
    }

    public async Task<LecturerAcademicSettingsResponse?> UpdateAsync(Guid id, UpdateLecturerAcademicSettingsRequest request, CancellationToken ct)
    {
        var entity = await _repo.GetByIdTrackedAsync(id, ct);
        if (entity is null)
        {
            return null;
        }

        entity.AcademicYear = request.AcademicYear.Trim();
        entity.Semester = request.Semester.Trim();
        entity.DefaultModule = request.DefaultModule.Trim();
        entity.AssignedFaculty = request.AssignedFaculty.Trim();
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repo.UpdateAsync(entity, ct);
        return entity.ToResponse();
    }
}
