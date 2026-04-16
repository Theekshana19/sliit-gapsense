using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

public sealed class Semester : BaseEntity
{
    public required string Name { get; set; }
    public required string AcademicYear { get; set; }
    public int Term { get; set; }
    public bool IsCurrent { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }

    public ICollection<StudentProfile> StudentProfiles { get; set; } = new List<StudentProfile>();
    public ICollection<AcademicModule> Modules { get; set; } = new List<AcademicModule>();
}
