using GapSense.Domain.Entities;
using GapSense.Domain.Enums;

namespace GapSense.Application.Services;

public interface IJwtTokenService
{
    Task<(string Token, DateTime ExpiresAt)> GenerateTokenAsync(
        Guid userId,
        string email,
        string fullName,
        UserRole role,
        bool rememberMe,
        CancellationToken cancellationToken = default);
}

