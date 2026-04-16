using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

public sealed class WeakTopicAnalysis : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile? StudentProfile { get; set; }
    public required string TopicName { get; set; }
    public required string Severity { get; set; }
    public string? Notes { get; set; }
}
