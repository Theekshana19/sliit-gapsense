using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

public sealed class MeetingOrFollowUp : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile? StudentProfile { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public DateTime ScheduledDate { get; set; }
    public required string MeetingType { get; set; }
    public required string Status { get; set; }
    public required string CreatedBy { get; set; }
}
