namespace GapSense.Application.DTOs.Responses;

public sealed record LecturerProfileResponse(
    Guid Id,
    string FullName,
    string Email,
    string PhoneNumber,
    string Department,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
