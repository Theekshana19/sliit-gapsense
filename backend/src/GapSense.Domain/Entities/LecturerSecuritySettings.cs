using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

public sealed class LecturerSecuritySettings : BaseEntity
{
    public Guid LecturerProfileId { get; set; }
    public string? PasswordHash { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public DateTime? LastLogoutAllDevicesUtc { get; set; }

    public LecturerProfile? LecturerProfile { get; set; }
}
