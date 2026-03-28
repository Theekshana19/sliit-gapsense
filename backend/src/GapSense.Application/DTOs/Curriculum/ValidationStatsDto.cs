namespace GapSense.Application.DTOs.Curriculum;

// stats shown at the top of the validation alerts page
public class ValidationStatsDto
{
    public int CriticalCount { get; set; }
    public int ComplianceScore { get; set; }
    public int ChecksPassed { get; set; }
}
