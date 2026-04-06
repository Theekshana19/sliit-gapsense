using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Application.Mappings;
using GapSense.Domain.Entities;

namespace GapSense.Application.Services;

public sealed class LecturerProfileService : ILecturerProfileService
{
    private readonly ILecturerProfileRepository _profiles;

    public LecturerProfileService(ILecturerProfileRepository profiles)
    {
        _profiles = profiles;
    }

    public async Task<IReadOnlyList<LecturerProfileResponse>> ListAsync(CancellationToken ct)
    {
        var items = await _profiles.ListAsync(ct);
        return items.Select(x => x.ToResponse()).ToList();
    }

    public async Task<LecturerProfileResponse?> GetAsync(Guid id, CancellationToken ct)
    {
        var e = await _profiles.GetByIdAsync(id, ct);
        return e?.ToResponse();
    }

    public async Task<LecturerProfileResponse> CreateAsync(CreateLecturerProfileRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await _profiles.GetByEmailAsync(email, ct) is not null)
        {
            throw new InvalidOperationException("A lecturer with this email already exists.");
        }

        var profile = new LecturerProfile
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PhoneNumber = request.PhoneNumber.Trim(),
            Department = request.Department.Trim(),
            IsActive = true,
        };

        await _profiles.AddWithDefaultSettingsAsync(profile, ct);
        return profile.ToResponse();
    }

    public async Task<LecturerProfileResponse?> UpdateAsync(Guid id, UpdateLecturerProfileRequest request, CancellationToken ct)
    {
        var entity = await _profiles.GetByIdTrackedAsync(id, ct);
        if (entity is null)
        {
            return null;
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var other = await _profiles.GetByEmailAsync(email, ct);
        if (other is not null && other.Id != id)
        {
            throw new InvalidOperationException("A lecturer with this email already exists.");
        }

        entity.FullName = request.FullName.Trim();
        entity.Email = email;
        entity.PhoneNumber = request.PhoneNumber.Trim();
        entity.Department = request.Department.Trim();
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _profiles.UpdateAsync(entity, ct);
        return entity.ToResponse();
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var entity = await _profiles.GetByIdTrackedAsync(id, ct);
        if (entity is null)
        {
            return false;
        }

        await _profiles.DeleteAsync(entity, ct);
        return true;
    }
}
