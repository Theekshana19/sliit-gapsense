using System.ComponentModel.DataAnnotations;

namespace GapSense.Application.DTOs.Curriculum;

// what the frontend sends when creating a new semester offering
public class CreateSemesterOfferingDto
{
    [Required(ErrorMessage = "Module is required")]
    public Guid ModuleId { get; set; }

    [Required(ErrorMessage = "Program is required")]
    public string Program { get; set; } = string.Empty;

    [Required(ErrorMessage = "Intake is required")]
    [StringLength(50)]
    public string Intake { get; set; } = string.Empty;

    [Required(ErrorMessage = "Semester is required")]
    [StringLength(10)]
    public string Semester { get; set; } = string.Empty;

    [Required(ErrorMessage = "Lecturer name is required")]
    [StringLength(100)]
    public string LecturerName { get; set; } = string.Empty;

    [StringLength(5)]
    public string LecturerAvatar { get; set; } = string.Empty;

    [StringLength(50)]
    public string AvatarColor { get; set; } = string.Empty;

    public string Status { get; set; } = "Draft";
}
