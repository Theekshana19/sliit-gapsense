using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GapSense.Domain.Entities;

// system-generated alerts for configuration issues
// the system detects problems like circular dependencies, missing weights, etc.
// these help lecturers fix issues before they affect student readiness checks
[Table("ValidationAlerts")]
public class ValidationAlert
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // what type of alert (Circular Dependency, Duplicate Mapping, Missing Topic Weight, Incomplete Setup)
    [Required]
    [StringLength(50)]
    public string Type { get; set; } = string.Empty;

    // which module has the issue
    [Required]
    [StringLength(6)]
    public string ModuleCode { get; set; } = string.Empty;

    // module name for display (so we dont need to join every time)
    [Required]
    [StringLength(200)]
    public string ModuleName { get; set; } = string.Empty;

    // how serious is this - Critical, Warning, or Info
    [Required]
    [StringLength(20)]
    public string Severity { get; set; } = "Warning";

    // description of what went wrong
    [Required]
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    // current status - Unresolved, In Progress, or Resolved
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Unresolved";

    // when this alert was detected
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
