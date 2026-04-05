namespace GapSense.Application.DTOs.Curriculum;

// stats shown at the top of the module management page
public class ModuleStatsDto
{
    public int TotalModules { get; set; }
    public int ActiveModules { get; set; }
    public int TotalCreditHours { get; set; }
    public int NeedsAttention { get; set; }
}
