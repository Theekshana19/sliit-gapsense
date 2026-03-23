using GapSense.Domain.Entities;

namespace GapSense.Application.Repositories;

public interface ILecturerProfileRepository
{
    Task<bool> StaffIdExistsAsync(string staffId, CancellationToken cancellationToken = default);
    Task<LecturerProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(LecturerProfile profile, CancellationToken cancellationToken = default);
}

