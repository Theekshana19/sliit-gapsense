namespace GapSense.Application.DTOs;

public record StudentSignupRequest
{
    public required string FullName { get; init; }
    public required string Email { get; init; }

    public required string StudentId { get; init; }
    public required string Batch { get; init; }
    public required string DegreeProgram { get; init; }

    public required string Password { get; init; }
    public required string ConfirmPassword { get; init; }
}

