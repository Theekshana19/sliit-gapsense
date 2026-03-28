using System.ComponentModel.DataAnnotations;

namespace GapSense.Models.DTOs.Curriculum;

// what the frontend sends when creating a new module
public class CreateModuleDto
{
    [Required(ErrorMessage = "Module code is required")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "Module code must be exactly 6 characters")]
    public string ModuleCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "Module name is required")]
    [StringLength(200, MinimumLength = 3, ErrorMessage = "Module name must be between 3 and 200 characters")]
    public string ModuleName { get; set; } = string.Empty;

    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Program is required")]
    public string Program { get; set; } = string.Empty;

    [Required(ErrorMessage = "Semester is required")]
    public string Semester { get; set; } = string.Empty;

    [Required]
    [Range(1, 6, ErrorMessage = "Credits must be between 1 and 6")]
    public int Credits { get; set; }

    public string Status { get; set; } = "Draft";
}
