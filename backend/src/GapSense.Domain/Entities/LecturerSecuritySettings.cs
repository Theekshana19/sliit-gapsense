using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

public sealed class LecturerSecuritySettings : BaseEntity
{
    public Guid LecturerProfileId { get; set; }
    public LecturerProfile LecturerProfile { get; set; } = null!;

    public bool TwoFactorEnabled { get; set; }
    public bool LoginAlertEnabled { get; set; } = true;
    public int SessionTimeoutMinutes { get; set; } = 30;

    public string? PasswordHash { get; set; }
    public DateTime? PasswordChangedAtUtc { get; set; }
}
