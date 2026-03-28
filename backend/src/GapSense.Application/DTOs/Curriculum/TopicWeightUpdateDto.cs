using System.ComponentModel.DataAnnotations;

namespace GapSense.Application.DTOs.Curriculum;

// used for batch updating topic weights from the weight configuration page
public class TopicWeightUpdateDto
{
    [Required]
    public Guid Id { get; set; }

    [Required]
    [Range(0, 100)]
    public int Weight { get; set; }
}
