using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

public sealed class NotificationFeedItem : BaseEntity
{
    public Guid LecturerProfileId { get; set; }
    public LecturerProfile LecturerProfile { get; set; } = null!;

    public required string Type { get; set; } // risk | academic | reminder | system
    public required string Title { get; set; }
    public required string Message { get; set; }
    public string? Route { get; set; }

    public required string SourceType { get; set; } // followup | student | intervention | report
    public required string SourceKey { get; set; } // deterministic de-dupe key

    public DateTime? ReadAtUtc { get; set; }
}
