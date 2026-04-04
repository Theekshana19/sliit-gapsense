using System.ComponentModel.DataAnnotations;

namespace GapSense.Application.DTOs.Readiness;

// what the frontend sends when updating a schedule
public class UpdateQuizScheduleDto
{
    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [Range(1, 10)]
    public int MaxAttempts { get; set; } = 1;

    public string ResultVisibility { get; set; } = "Immediate";

    public string Status { get; set; } = "Scheduled";
}
