namespace GapSense.Models.DTOs.Curriculum;

// stats shown at the top of prerequisite management page
public class PrerequisiteStatsDto
{
    public int ActivePrerequisites { get; set; }
    public int MandatoryPaths { get; set; }
    public int AvgRelevanceScore { get; set; }
    public int DepthLevels { get; set; }
}
