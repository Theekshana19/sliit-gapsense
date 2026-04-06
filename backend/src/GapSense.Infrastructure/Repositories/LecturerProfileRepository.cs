using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class LecturerProfileRepository : ILecturerProfileRepository
{
    private readonly GapSenseDbContext _db;

    public LecturerProfileRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public Task<LecturerProfile?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _db.LecturerProfiles.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<LecturerProfile?> GetByIdTrackedAsync(Guid id, CancellationToken ct) =>
        _db.LecturerProfiles.FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<LecturerProfile?> GetByEmailAsync(string email, CancellationToken ct) =>
        _db.LecturerProfiles.AsNoTracking().FirstOrDefaultAsync(x => x.Email == email, ct);

    public async Task<IReadOnlyList<LecturerProfile>> ListAsync(CancellationToken ct)
    {
        var list = await _db.LecturerProfiles
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
        return list;
    }

    public async Task AddAsync(LecturerProfile entity, CancellationToken ct)
    {
        _db.LecturerProfiles.Add(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task AddWithDefaultSettingsAsync(LecturerProfile entity, CancellationToken ct)
    {
        _db.LecturerProfiles.Add(entity);
        await _db.SaveChangesAsync(ct);

        var academic = new LecturerAcademicSettings
        {
            LecturerProfileId = entity.Id,
            AcademicYear = "2025/2026",
            Semester = "Semester 1",
            DefaultModule = "—",
            AssignedFaculty = entity.Department,
            IsActive = true,
        };
        var notification = new LecturerNotificationSettings
        {
            LecturerProfileId = entity.Id,
            EmailAlerts = true,
            StudentRiskAlerts = true,
            AssignmentReminders = false,
            WeeklyReports = true,
            IsActive = true,
        };
        var security = new LecturerSecuritySettings
        {
            LecturerProfileId = entity.Id,
            TwoFactorEnabled = false,
            IsActive = true,
        };

        _db.LecturerAcademicSettings.Add(academic);
        _db.LecturerNotificationSettings.Add(notification);
        _db.LecturerSecuritySettings.Add(security);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(LecturerProfile entity, CancellationToken ct)
    {
        _db.LecturerProfiles.Update(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(LecturerProfile entity, CancellationToken ct)
    {
        _db.LecturerProfiles.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }
}
