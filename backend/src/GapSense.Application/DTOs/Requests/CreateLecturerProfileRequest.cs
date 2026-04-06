namespace GapSense.Application.DTOs.Requests;

public sealed record CreateLecturerProfileRequest(
    string FullName,
    string Email,
    string PhoneNumber,
    string Department);
