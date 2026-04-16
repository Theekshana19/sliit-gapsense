namespace GapSense.Application.DTOs.Responses;

public sealed record LecturerAcademicSettingsResponse(
    Guid Id,
    string Semester,
    string AcademicYear,
    string DefaultModule,
    string AssignedFaculty
);
