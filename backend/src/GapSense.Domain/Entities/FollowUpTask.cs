using GapSense.Domain.Common;
using GapSense.Domain.Enums;

namespace GapSense.Domain.Entities;

public sealed class FollowUpTask : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile? StudentProfile { get; set; }

    public required string Title { get; set; }
    public string? Description { get; set; }
    public DateTime DueDate { get; set; }
    public FollowUpStatus Status { get; set; }
    public FollowUpPriority Priority { get; set; }
    public required string AssignedTo { get; set; }
    public DateTime? ReminderSentAt { get; set; }
    public bool IsDismissed { get; set; }
}
