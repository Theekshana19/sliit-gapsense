namespace GapSense.Application.DTOs.Curriculum;

// what we send back when the frontend requests semester offerings
public class SemesterOfferingDto
{
    public Guid Id { get; set; }
    public Guid ModuleId { get; set; }
    public string ModuleCode { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public string Program { get; set; } = string.Empty;
    public string Intake { get; set; } = string.Empty;
    public string Semester { get; set; } = string.Empty;
    public string LecturerName { get; set; } = string.Empty;
    public string LecturerAvatar { get; set; } = string.Empty;
    public string AvatarColor { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
}
