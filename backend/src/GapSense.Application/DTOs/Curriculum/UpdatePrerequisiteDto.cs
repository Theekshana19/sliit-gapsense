using System.ComponentModel.DataAnnotations;

namespace GapSense.Application.DTOs.Curriculum;

// what the frontend sends when updating an existing prerequisite mapping
// note: we don't allow changing the main or prerequisite module ids - only the relationship type, weight, notes, and status
// if the user wants to change which modules are linked, they should delete and recreate
public class UpdatePrerequisiteDto
{
    [Required]
    public string RelationshipType { get; set; } = "Mandatory";

    [Required]
    [Range(0, 100, ErrorMessage = "Relevance weight must be between 0 and 100")]
    public int RelevanceWeight { get; set; }

    [StringLength(500)]
    public string Notes { get; set; } = string.Empty;

    [StringLength(20)]
    public string Status { get; set; } = "Validated";
}
