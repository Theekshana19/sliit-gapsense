using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GapSense.Models.Entities;

// represents an academic module like "Data Structures" or "Database Systems"
// this is the main table - topics, prerequisites, and quizzes all link back to this
[Table("Modules")]
public class Module
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // module code like "IT2040" - must be exactly 6 characters and unique
    [Required]
    [StringLength(6, MinimumLength = 6)]
    public string ModuleCode { get; set; } = string.Empty;

    // full name of the module
    [Required]
    [StringLength(200)]
    public string ModuleName { get; set; } = string.Empty;

    // what this module is about
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    // which degree program this belongs to (BSc IT, BSc CS, BSc SE, BSc DS)
    [Required]
    [StringLength(20)]
    public string Program { get; set; } = string.Empty;

    // which semester this module is in (Y1S1, Y2S1, etc.)
    [Required]
    [StringLength(10)]
    public string Semester { get; set; } = string.Empty;

    // credit hours (1 to 6)
    [Required]
    [Range(1, 6)]
    public int Credits { get; set; }

    // current status - Active, Draft, or Archived
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Draft";

    // timestamps - auto set when creating and updating
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // navigation properties - EF Core uses these to load related data
    // one module has many topics
    public ICollection<Topic> Topics { get; set; } = new List<Topic>();

    // one module can be a prerequisite for many other modules
    public ICollection<Prerequisite> PrerequisitesAsMain { get; set; } = new List<Prerequisite>();
    public ICollection<Prerequisite> PrerequisitesAsPrereq { get; set; } = new List<Prerequisite>();

    // one module can have many semester offerings
    public ICollection<SemesterOffering> SemesterOfferings { get; set; } = new List<SemesterOffering>();
}
