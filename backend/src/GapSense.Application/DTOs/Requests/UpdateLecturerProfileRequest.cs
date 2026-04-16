namespace GapSense.Application.DTOs.Requests;

public sealed class UpdateLecturerProfileRequest
{
    public required string FullName { get; init; }
    public required string Email { get; init; }
    public string? PhoneNumber { get; init; }
    public required string Department { get; init; }
}
