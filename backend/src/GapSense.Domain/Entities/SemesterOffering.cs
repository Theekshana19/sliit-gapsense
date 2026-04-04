using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GapSense.Domain.Entities;

// represents a module being offered in a specific semester and intake
// example: "IT2040 Data Structures" offered in "February 2024" intake, taught by "Dr. Kamal"
[Table("SemesterOfferings")]
public class SemesterOffering
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // which module is being offered
    [Required]
    public Guid ModuleId { get; set; }

    // which degree program
    [Required]
    [StringLength(20)]
    public string Program { get; set; } = string.Empty;

    // which intake batch (e.g. "February 2024")
    [Required]
    [StringLength(50)]
    public string Intake { get; set; } = string.Empty;

    // which semester (e.g. "Y2S1")
    [Required]
    [StringLength(10)]
    public string Semester { get; set; } = string.Empty;

    // lecturer assigned to teach this offering
    [Required]
    [StringLength(100)]
    public string LecturerName { get; set; } = string.Empty;

    // lecturer initials for avatar display (e.g. "AP")
    [StringLength(5)]
    public string LecturerAvatar { get; set; } = string.Empty;

    // css class for avatar background color
    [StringLength(50)]
    public string AvatarColor { get; set; } = string.Empty;

    // status - Published, Draft, or Inactive
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Draft";

    // when this offering was created
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // navigation property - link back to the module
    [ForeignKey("ModuleId")]
    public Module Module { get; set; } = null!;
}
