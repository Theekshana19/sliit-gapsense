namespace GapSense.Application.DTOs.Requests;

public class BatchReadinessFilterRequest
{
    public Guid SemesterId { get; set; }
    /// <summary>Optional academic module id; when omitted, all modules in the semester are included.</summary>
    public Guid? ModuleId { get; set; }
    /// <summary>Matches StudentProfile.Batch (intake cohort).</summary>
    public string? IntakeBatch { get; set; }
}
