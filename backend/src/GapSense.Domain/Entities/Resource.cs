using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GapSense.Domain.Entities;

// learning resource that students can access to prepare for quizzes
// linked to a module so students can find relevant materials
[Table("Resources")]
public class Resource
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // resource title
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    // what this resource covers
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    // type of resource - PDF, Video, Article, or Link
    [Required]
    [StringLength(20)]
    public string Type { get; set; } = "Link";

    // URL to the resource
    [Required]
    [StringLength(500)]
    public string Url { get; set; } = string.Empty;

    // which topic this resource is for
    [StringLength(200)]
    public string Topic { get; set; } = string.Empty;

    // which module this resource belongs to (FK to Sewwandi's Modules table)
    [Required]
    public Guid ModuleId { get; set; }

    // timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // navigation property
    [ForeignKey("ModuleId")]
    public Module Module { get; set; } = null!;
}
