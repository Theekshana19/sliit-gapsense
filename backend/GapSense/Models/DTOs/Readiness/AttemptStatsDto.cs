namespace GapSense.Models.DTOs.Readiness;

// stats shown at the top of attempt history page
public class AttemptStatsDto
{
    public int TotalAttempts { get; set; }
    public decimal AvgSuccessRate { get; set; }
    public int FlaggedAttempts { get; set; }
    public decimal ChangePercentage { get; set; }
}
