using GapSense.Domain.Entities;

namespace GapSense.Application.Repositories;

public interface IAdminProfileRepository
{
    Task<bool> AdminCodeExistsAsync(string adminCode, CancellationToken cancellationToken = default);
    Task<AdminProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(AdminProfile profile, CancellationToken cancellationToken = default);
}

