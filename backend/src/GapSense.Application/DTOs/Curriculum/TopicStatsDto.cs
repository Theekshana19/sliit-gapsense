namespace GapSense.Application.DTOs.Curriculum;

// stats for the topic management page header
public class TopicStatsDto
{
    public int TotalTopics { get; set; }
    public int ValidatedCount { get; set; }
    public int DraftCount { get; set; }
    public int TotalWeight { get; set; } // should be 100%
    public int AlignmentPercentage { get; set; }
}
