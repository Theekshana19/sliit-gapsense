namespace GapSense.Domain.Entities;

public class CourseModule
{
    public Guid Id { get; set; }

    public string Code { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int SortOrder { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public ICollection<LecturerModuleAssignment> LecturerAssignments { get; set; } =
        new List<LecturerModuleAssignment>();
}
