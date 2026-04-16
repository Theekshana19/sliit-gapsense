namespace GapSense.Application.DTOs.Requests;

public sealed class CreateInterventionPlanRequest
{
    public string ModuleCode { get; set; } = string.Empty;
    public string Batch { get; set; } = string.Empty;
    public string RiskGroup { get; set; } = string.Empty;
    public string WeakTopic { get; set; } = string.Empty;
    public string InterventionType { get; set; } = string.Empty;
    public DateOnly PlannedDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? AssignedLecturer { get; set; }
    public string? Notes { get; set; }
    public Guid? StudentProfileId { get; set; }
    public bool IsDraft { get; set; }
}
