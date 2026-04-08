namespace GapSense.Application.DTOs;

public record CreateRiskThresholdRequest
{
    public required string RuleName { get; init; }
    public int LowRiskMin { get; init; }
    public int MediumRiskMin { get; init; }
    public int MediumRiskMax { get; init; }
    public int HighRiskMax { get; init; }
    public bool IsActive { get; init; }
    public string? Notes { get; init; }
}
