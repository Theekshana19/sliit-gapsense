namespace GapSense.Application.DTOs;

public record RiskThresholdResponse
{
    public Guid Id { get; init; }
    public string RuleName { get; init; } = string.Empty;
    public int LowRiskMin { get; init; }
    public int MediumRiskMin { get; init; }
    public int MediumRiskMax { get; init; }
    public int HighRiskMax { get; init; }
    public bool IsActive { get; init; }
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
