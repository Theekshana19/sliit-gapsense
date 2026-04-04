using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GapSense.Domain.Entities;

// defines a prerequisite relationship between two modules
// example: "Data Structures" requires "OOP" as a prerequisite
// MainModule = the module that HAS the prerequisite
// PrerequisiteModule = the module that MUST be completed first
[Table("Prerequisites")]
public class Prerequisite
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // the module that has this prerequisite requirement
    [Required]
    public Guid MainModuleId { get; set; }

    // the module that must be completed before taking the main module
    [Required]
    public Guid PrerequisiteModuleId { get; set; }

    // is this prerequisite mandatory or optional?
    [Required]
    [StringLength(20)]
    public string RelationshipType { get; set; } = "Mandatory";

    // how relevant is this prerequisite (0 to 100 percent)
    [Required]
    [Range(0, 100)]
    public int RelevanceWeight { get; set; }

    // any extra notes about why this prerequisite is needed
    [StringLength(500)]
    public string Notes { get; set; } = string.Empty;

    // status - Validated, Review Required, or Inactive
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Review Required";

    // when this prerequisite was created
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // navigation properties - links to both modules
    [ForeignKey("MainModuleId")]
    public Module MainModule { get; set; } = null!;

    [ForeignKey("PrerequisiteModuleId")]
    public Module PrerequisiteModule { get; set; } = null!;
}
