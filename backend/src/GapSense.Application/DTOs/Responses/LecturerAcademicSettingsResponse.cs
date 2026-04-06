namespace GapSense.Application.DTOs.Responses;

public sealed record LecturerAcademicSettingsResponse(
    Guid Id,
    Guid LecturerProfileId,
    string AcademicYear,
    string Semester,
    string DefaultModule,
    string AssignedFaculty,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
