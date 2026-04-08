namespace GapSense.Application.DTOs;

public record AdminSignupRequest
{
    public required string FullName { get; init; }
    public required string InstitutionalEmail { get; init; }

    public required string Password { get; init; }
    public required string ConfirmPassword { get; init; }

    public required string AdminCode { get; init; }
}

