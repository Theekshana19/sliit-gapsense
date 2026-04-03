using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

public sealed class ReadinessResult : BaseEntity
{
    public required string StudentId { get; set; }
    public required string ModuleCode { get; set; }
    public required string Batch { get; set; }
    public required string Semester { get; set; }
    public decimal ReadinessScore { get; set; }
    public required string Status { get; set; }
}

