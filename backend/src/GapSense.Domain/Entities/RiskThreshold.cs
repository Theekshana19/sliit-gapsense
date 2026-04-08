namespace GapSense.Domain.Entities;

public class RiskThreshold
{
    public Guid Id { get; set; }
    public string RuleName { get; set; } = string.Empty;
    public int LowRiskMin { get; set; }
    public int MediumRiskMin { get; set; }
    public int MediumRiskMax { get; set; }
    public int HighRiskMax { get; set; }
    public bool IsActive { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
