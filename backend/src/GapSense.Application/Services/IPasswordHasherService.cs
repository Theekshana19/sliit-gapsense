using GapSense.Domain.Entities;

namespace GapSense.Application.Services;

public interface IPasswordHasherService
{
    Task<string> HashPasswordAsync(User user, string password, CancellationToken cancellationToken = default);
    Task<bool> VerifyPasswordAsync(User user, string providedPassword, string storedPasswordHash, CancellationToken cancellationToken = default);
}

