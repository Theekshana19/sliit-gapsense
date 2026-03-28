using System.ComponentModel.DataAnnotations;

namespace GapSense.Application.DTOs.Curriculum;

// what the frontend sends when updating an existing topic
public class UpdateTopicDto
{
    [Required(ErrorMessage = "Topic name is required")]
    [StringLength(200, MinimumLength = 3)]
    public string TopicName { get; set; } = string.Empty;

    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [Range(0, 100, ErrorMessage = "Weight must be between 0 and 100")]
    public int Weight { get; set; }

    [Required]
    public string ImportanceLevel { get; set; } = "Medium";

    public string Status { get; set; } = "Draft";
    public bool IsActive { get; set; } = true;
}
