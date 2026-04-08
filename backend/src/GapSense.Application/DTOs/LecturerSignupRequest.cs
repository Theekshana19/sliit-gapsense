namespace GapSense.Application.DTOs;

public record LecturerSignupRequest
{
    public required string FullName { get; init; }
    public required string Email { get; init; }

    public required string StaffId { get; init; }
    public required string Department { get; init; }
    public required string Specialization { get; init; }

    public required string Password { get; init; }
    public required string ConfirmPassword { get; init; }
}

