using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GapSense.Domain.Entities;

// represents a topic inside a module (e.g. "Binary Trees" inside "Data Structures")
// each topic has a weight percentage - all topics in a module should add up to 100%
[Table("Topics")]
public class Topic
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // which module this topic belongs to
    [Required]
    public Guid ModuleId { get; set; }

    // topic name like "Binary Trees" or "SQL Queries"
    [Required]
    [StringLength(200)]
    public string TopicName { get; set; } = string.Empty;

    // description of what this topic covers
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    // how much this topic weighs in the module (0 to 100 percent)
    // all topics in one module should total 100%
    [Required]
    [Range(0, 100)]
    public int Weight { get; set; }

    // how important this topic is - Critical, High, Medium, or Low
    [Required]
    [StringLength(20)]
    public string ImportanceLevel { get; set; } = "Medium";

    // validation status - Validated, Draft, or Review
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Draft";

    // whether this topic is currently active
    public bool IsActive { get; set; } = true;

    // timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // navigation property - link back to the parent module
    [ForeignKey("ModuleId")]
    public Module Module { get; set; } = null!;
}
