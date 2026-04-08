namespace GapSense.Domain.Entities;

public class StudentProfile
{
    public Guid UserId { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string Batch { get; set; } = string.Empty;
    public string DegreeProgram { get; set; } = string.Empty;

    public User? User { get; set; }
}

