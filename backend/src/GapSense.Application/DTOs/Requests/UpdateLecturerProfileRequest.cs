namespace GapSense.Application.DTOs.Requests;

public sealed record UpdateLecturerProfileRequest(
    string FullName,
    string Email,
    string PhoneNumber,
    string Department,
    bool IsActive);
