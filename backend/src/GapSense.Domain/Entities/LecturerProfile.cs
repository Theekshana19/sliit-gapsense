using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

public sealed class LecturerProfile : BaseEntity
{
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public required string PhoneNumber { get; set; }
    public required string Department { get; set; }

    public LecturerAcademicSettings? AcademicSettings { get; set; }
    public LecturerNotificationSettings? NotificationSettings { get; set; }
    public LecturerSecuritySettings? SecuritySettings { get; set; }
    public ICollection<InAppNotification> InAppNotifications { get; set; } = new List<InAppNotification>();
}
