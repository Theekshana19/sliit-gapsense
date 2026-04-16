namespace GapSense.Application.DTOs.Requests;

public sealed class UpdateLecturerAcademicSettingsRequest
{
    public required string Semester { get; init; }
    public required string AcademicYear { get; init; }
    public required string DefaultModule { get; init; }
    public required string AssignedFaculty { get; init; }
}
