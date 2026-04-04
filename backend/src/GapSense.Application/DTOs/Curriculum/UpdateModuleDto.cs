using System.ComponentModel.DataAnnotations;

namespace GapSense.Application.DTOs.Curriculum;

// what the frontend sends when updating an existing module
// same as CreateModuleDto but separate class so we can change it later if needed
public class UpdateModuleDto
{
    [Required(ErrorMessage = "Module code is required")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "Module code must be exactly 6 characters")]
    public string ModuleCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "Module name is required")]
    [StringLength(200, MinimumLength = 3)]
    public string ModuleName { get; set; } = string.Empty;

    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public string Program { get; set; } = string.Empty;

    [Required]
    public string Semester { get; set; } = string.Empty;

    [Required]
    [Range(1, 6, ErrorMessage = "Credits must be between 1 and 6")]
    public int Credits { get; set; }

    public string Status { get; set; } = "Draft";
}
