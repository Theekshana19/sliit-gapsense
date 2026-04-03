using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

public sealed class RiskThreshold : BaseEntity
{
    public required string ModuleCode { get; set; }
    public required string Batch { get; set; }
    public required string Semester { get; set; }

    /// <summary>Percentage below which a student is considered high-risk.</summary>
    public int HighRiskBelowPercent { get; set; }

    /// <summary>Percentage below which a student is considered medium-risk.</summary>
    public int MediumRiskBelowPercent { get; set; }
}

