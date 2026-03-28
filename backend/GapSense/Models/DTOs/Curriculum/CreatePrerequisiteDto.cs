using System.ComponentModel.DataAnnotations;

namespace GapSense.Models.DTOs.Curriculum;

// what the frontend sends when creating a new prerequisite mapping
public class CreatePrerequisiteDto
{
    [Required(ErrorMessage = "Main module is required")]
    public Guid MainModuleId { get; set; }

    [Required(ErrorMessage = "Prerequisite module is required")]
    public Guid PrerequisiteModuleId { get; set; }

    [Required]
    public string RelationshipType { get; set; } = "Mandatory";

    [Required]
    [Range(0, 100, ErrorMessage = "Relevance weight must be between 0 and 100")]
    public int RelevanceWeight { get; set; }

    [StringLength(500)]
    public string Notes { get; set; } = string.Empty;
}
