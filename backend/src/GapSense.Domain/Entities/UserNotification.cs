namespace GapSense.Domain.Entities;

/// <summary>In-app notification for a single user (notification center).</summary>
public class UserNotification
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    /// <summary>risk | academic | reminder | system</summary>
    public string Type { get; set; } = "system";

    public bool IsRead { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
