using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Application.Mappings;
using Microsoft.AspNetCore.Identity;

namespace GapSense.Application.Services;

public sealed class LecturerSecuritySettingsService : ILecturerSecuritySettingsService
{
    private readonly ILecturerSecuritySettingsRepository _repo;
    private readonly IPasswordHasher<object> _passwordHasher;

    public LecturerSecuritySettingsService(
        ILecturerSecuritySettingsRepository repo,
        IPasswordHasher<object> passwordHasher)
    {
        _repo = repo;
        _passwordHasher = passwordHasher;
    }

    public async Task<LecturerSecuritySettingsResponse?> GetAsync(Guid id, CancellationToken ct)
    {
        var e = await _repo.GetByIdAsync(id, ct);
        return e?.ToResponse();
    }

    public async Task<LecturerSecuritySettingsResponse?> GetByLecturerAsync(Guid lecturerProfileId, CancellationToken ct)
    {
        var e = await _repo.GetByLecturerProfileIdAsync(lecturerProfileId, ct);
        return e?.ToResponse();
    }

    public async Task<LecturerSecuritySettingsResponse?> UpdateAsync(Guid id, UpdateLecturerSecuritySettingsRequest request, CancellationToken ct)
    {
        var entity = await _repo.GetByIdTrackedAsync(id, ct);
        if (entity is null)
        {
            return null;
        }

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            entity.PasswordHash = _passwordHasher.HashPassword(new object(), request.NewPassword.Trim());
        }

        entity.TwoFactorEnabled = request.TwoFactorEnabled;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repo.UpdateAsync(entity, ct);
        return entity.ToResponse();
    }
}
