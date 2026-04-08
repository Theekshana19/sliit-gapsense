namespace GapSense.Domain.Entities;

public class AdminProfile
{
    public Guid UserId { get; set; }
    public string AdminCode { get; set; } = string.Empty;

    public User? User { get; set; }
}

