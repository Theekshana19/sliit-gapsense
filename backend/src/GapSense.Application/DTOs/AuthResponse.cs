using GapSense.Domain.Enums;

namespace GapSense.Application.DTOs;

public record AuthResponse
{
    public required string Token { get; init; }
    public required DateTime ExpiresAt { get; init; }

    public required Guid UserId { get; init; }
    public required string FullName { get; init; }
    public required string Email { get; init; }
    public required UserRole Role { get; init; }

    public UserProfileResponse? Profile { get; init; }
}

