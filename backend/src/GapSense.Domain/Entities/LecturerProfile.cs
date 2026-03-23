namespace GapSense.Domain.Entities;

public class LecturerProfile
{
    public Guid UserId { get; set; }
    public string StaffId { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;

    public User? User { get; set; }
}

