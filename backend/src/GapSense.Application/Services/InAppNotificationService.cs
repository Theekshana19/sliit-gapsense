using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Application.Mappings;
using GapSense.Domain.Entities;
using GapSense.Domain.Enums;

namespace GapSense.Application.Services;

public sealed class InAppNotificationService : IInAppNotificationService
{
    private readonly IInAppNotificationRepository _repo;

    public InAppNotificationService(IInAppNotificationRepository repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<InAppNotificationResponse>> ListForLecturerAsync(Guid lecturerProfileId, NotificationKind? type, CancellationToken ct)
    {
        var items = await _repo.ListByLecturerAsync(lecturerProfileId, type, ct);
        return items.Select(x => x.ToResponse()).ToList();
    }

    public Task<int> GetUnreadCountAsync(Guid lecturerProfileId, CancellationToken ct) =>
        _repo.CountUnreadAsync(lecturerProfileId, ct);

    public async Task<InAppNotificationResponse?> GetAsync(Guid id, CancellationToken ct)
    {
        var e = await _repo.GetByIdAsync(id, ct);
        return e?.ToResponse();
    }

    public async Task<InAppNotificationResponse> CreateAsync(CreateInAppNotificationRequest request, CancellationToken ct)
    {
        var entity = new InAppNotification
        {
            LecturerProfileId = request.LecturerProfileId,
            Title = request.Title.Trim(),
            Message = request.Message.Trim(),
            Type = request.Type,
            IsRead = false,
            IsActive = true,
        };

        await _repo.AddAsync(entity, ct);
        return entity.ToResponse();
    }

    public async Task<InAppNotificationResponse?> UpdateAsync(Guid id, UpdateInAppNotificationRequest request, CancellationToken ct)
    {
        var entity = await _repo.GetByIdTrackedAsync(id, ct);
        if (entity is null)
        {
            return null;
        }

        entity.Title = request.Title.Trim();
        entity.Message = request.Message.Trim();
        entity.Type = request.Type;
        entity.IsRead = request.IsRead;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repo.UpdateAsync(entity, ct);
        return entity.ToResponse();
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var entity = await _repo.GetByIdTrackedAsync(id, ct);
        if (entity is null)
        {
            return false;
        }

        await _repo.DeleteAsync(entity, ct);
        return true;
    }

    public async Task<bool> MarkReadAsync(Guid id, CancellationToken ct)
    {
        var entity = await _repo.GetByIdTrackedAsync(id, ct);
        if (entity is null)
        {
            return false;
        }

        entity.IsRead = true;
        entity.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(entity, ct);
        return true;
    }

    public Task MarkAllReadAsync(Guid lecturerProfileId, CancellationToken ct) =>
        _repo.MarkAllReadAsync(lecturerProfileId, ct);

    public Task ClearAllAsync(Guid lecturerProfileId, CancellationToken ct) =>
        _repo.DeleteAllForLecturerAsync(lecturerProfileId, ct);
}
