using System.ComponentModel.DataAnnotations;

namespace GapSense.Models.DTOs.Curriculum;

// what the frontend sends when updating an alert status
public class UpdateAlertStatusDto
{
    [Required(ErrorMessage = "Status is required")]
    public string Status { get; set; } = string.Empty; // Unresolved, In Progress, Resolved
}
