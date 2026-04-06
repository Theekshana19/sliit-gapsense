using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Application.Mappings;

namespace GapSense.Application.Services;

public sealed class LecturerNotificationSettingsService : ILecturerNotificationSettingsService
{
    private readonly ILecturerNotificationSettingsRepository _repo;

    public LecturerNotificationSettingsService(ILecturerNotificationSettingsRepository repo)
    {
        _repo = repo;
    }

    public async Task<LecturerNotificationSettingsResponse?> GetAsync(Guid id, CancellationToken ct)
    {
        var e = await _repo.GetByIdAsync(id, ct);
        return e?.ToResponse();
    }

    public async Task<LecturerNotificationSettingsResponse?> GetByLecturerAsync(Guid lecturerProfileId, CancellationToken ct)
    {
        var e = await _repo.GetByLecturerProfileIdAsync(lecturerProfileId, ct);
        return e?.ToResponse();
    }

    public async Task<LecturerNotificationSettingsResponse?> UpdateAsync(Guid id, UpdateLecturerNotificationSettingsRequest request, CancellationToken ct)
    {
        var entity = await _repo.GetByIdTrackedAsync(id, ct);
        if (entity is null)
        {
            return null;
        }

        entity.EmailAlerts = request.EmailAlerts;
        entity.StudentRiskAlerts = request.StudentRiskAlerts;
        entity.AssignmentReminders = request.AssignmentReminders;
        entity.WeeklyReports = request.WeeklyReports;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repo.UpdateAsync(entity, ct);
        return entity.ToResponse();
    }
}
