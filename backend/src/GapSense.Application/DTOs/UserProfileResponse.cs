using GapSense.Domain.Enums;

namespace GapSense.Application.DTOs;

public record UserProfileResponse
{
    public Guid UserId { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public UserRole Role { get; init; }

    // Role-specific fields
    public string? StudentId { get; init; }
    public string? Batch { get; init; }
    public string? DegreeProgram { get; init; }

    public string? StaffId { get; init; }
    public string? Department { get; init; }
    public string? Specialization { get; init; }

    public string? AdminCode { get; init; }
}

