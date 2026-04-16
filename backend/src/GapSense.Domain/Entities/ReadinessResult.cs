using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

public sealed class ReadinessResult : BaseEntity
{
    public required string StudentId { get; set; }
    public required string ModuleCode { get; set; }
    public required string Batch { get; set; }
    /// <summary>Legacy text label; prefer <see cref="SemesterId"/> for filtering.</summary>
    public required string Semester { get; set; }
    public Guid? SemesterId { get; set; }
    public Semester? SemesterRef { get; set; }
    public decimal ReadinessScore { get; set; }
    public required string Status { get; set; }
}

