namespace GapSense.Models.DTOs.Curriculum;

// what we send back when the frontend requests prerequisites
public class PrerequisiteDto
{
    public Guid Id { get; set; }
    public Guid MainModuleId { get; set; }
    public string MainModuleCode { get; set; } = string.Empty;
    public string MainModuleName { get; set; } = string.Empty;
    public Guid PrerequisiteModuleId { get; set; }
    public string PrerequisiteModuleCode { get; set; } = string.Empty;
    public string PrerequisiteModuleName { get; set; } = string.Empty;
    public string RelationshipType { get; set; } = string.Empty;
    public int RelevanceWeight { get; set; }
    public string Notes { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
}
