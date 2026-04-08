namespace GapSense.Domain.Entities;

public class StudentIntervention
{
    public Guid Id { get; set; }

    public Guid StudentUserId { get; set; }

    public Guid CreatedByUserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Notes { get; set; }

    /// <summary>Open or closed follow-up items.</summary>
    public string Status { get; set; } = "open";

    public DateTime CreatedAtUtc { get; set; }
}
