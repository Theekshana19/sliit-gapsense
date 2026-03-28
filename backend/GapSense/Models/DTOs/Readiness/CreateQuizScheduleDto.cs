using System.ComponentModel.DataAnnotations;

namespace GapSense.Models.DTOs.Readiness;

// what the frontend sends when creating a schedule
public class CreateQuizScheduleDto
{
    [Required(ErrorMessage = "Quiz is required")]
    public Guid QuizId { get; set; }

    [Required(ErrorMessage = "Start date is required")]
    public DateTime StartDate { get; set; }

    [Required(ErrorMessage = "End date is required")]
    public DateTime EndDate { get; set; }

    [Range(1, 10)]
    public int MaxAttempts { get; set; } = 1;

    public string ResultVisibility { get; set; } = "Immediate";

    public string Status { get; set; } = "Scheduled";
}
