using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

public sealed class InterventionAssignment : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile? StudentProfile { get; set; }
    public required string AssignedToName { get; set; }
    public required string AssignedToRole { get; set; }
    public required string InterventionType { get; set; }
    public required string Priority { get; set; }
    public string? Note { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? FollowUpDate { get; set; }
    public required string Status { get; set; }
}
