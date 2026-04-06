using GapSense.Domain.Common;
using GapSense.Domain.Enums;

namespace GapSense.Domain.Entities;

public sealed class InAppNotification : BaseEntity
{
    public Guid LecturerProfileId { get; set; }
    public required string Title { get; set; }
    public required string Message { get; set; }
    public NotificationKind Type { get; set; }
    public bool IsRead { get; set; }

    public LecturerProfile? LecturerProfile { get; set; }
}
