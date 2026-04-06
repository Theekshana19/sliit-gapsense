namespace GapSense.Application.DTOs.Requests;

public sealed record UpdateLecturerAcademicSettingsRequest(
    string AcademicYear,
    string Semester,
    string DefaultModule,
    string AssignedFaculty,
    bool IsActive);
