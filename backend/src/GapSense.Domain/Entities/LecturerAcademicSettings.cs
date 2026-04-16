using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

public sealed class LecturerAcademicSettings : BaseEntity
{
    public Guid LecturerProfileId { get; set; }
    public LecturerProfile LecturerProfile { get; set; } = null!;

    public required string Semester { get; set; }
    public required string AcademicYear { get; set; }
    public required string DefaultModule { get; set; }
    public required string AssignedFaculty { get; set; }
}
