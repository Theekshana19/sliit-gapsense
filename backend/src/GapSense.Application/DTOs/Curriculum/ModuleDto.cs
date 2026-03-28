namespace GapSense.Application.DTOs.Curriculum;

// what we send back to the frontend when they request a module
public class ModuleDto
{
    public Guid Id { get; set; }
    public string ModuleCode { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Program { get; set; } = string.Empty;
    public string Semester { get; set; } = string.Empty;
    public int Credits { get; set; }
    public string Status { get; set; } = string.Empty;
    public int TopicCount { get; set; }
    public int PrerequisiteCount { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string UpdatedAt { get; set; } = string.Empty;
}
