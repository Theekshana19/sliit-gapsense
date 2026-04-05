namespace GapSense.Application.DTOs.Curriculum;

// what we send back when the frontend requests validation alerts
public class ValidationAlertDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
}
