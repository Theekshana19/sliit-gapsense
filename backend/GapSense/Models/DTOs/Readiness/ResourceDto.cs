namespace GapSense.Models.DTOs.Readiness;

// what we send back for a learning resource
public class ResourceDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
    public string UpdatedAt { get; set; } = string.Empty;
}
