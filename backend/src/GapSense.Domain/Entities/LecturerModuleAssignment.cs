namespace GapSense.Domain.Entities;

public class LecturerModuleAssignment
{
    public Guid Id { get; set; }

    public Guid LecturerUserId { get; set; }

    public Guid CourseModuleId { get; set; }

    public DateTime AssignedAtUtc { get; set; }

    public CourseModule CourseModule { get; set; } = null!;
}
