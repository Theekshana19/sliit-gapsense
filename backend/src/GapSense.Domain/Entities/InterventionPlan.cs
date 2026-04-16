using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

/// <summary>
/// Cohort-level intervention plan for the Intervention Planning workspace (distinct from per-student <see cref="InterventionAssignment"/>).
/// </summary>
public sealed class InterventionPlan : BaseEntity
{
    public required string ModuleCode { get; set; }
    public required string Batch { get; set; }
    public required string RiskGroup { get; set; }
    public required string WeakTopic { get; set; }
    public required string InterventionType { get; set; }
    public DateOnly PlannedDate { get; set; }
    public required string Status { get; set; }
    public string? AssignedLecturer { get; set; }
    public string? Notes { get; set; }
    public Guid? StudentProfileId { get; set; }
    public StudentProfile? StudentProfile { get; set; }
    public bool IsDraft { get; set; }
    public ICollection<InterventionReview> Reviews { get; set; } = new List<InterventionReview>();
}
