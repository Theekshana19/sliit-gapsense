using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

public sealed class LecturerNotificationSettings : BaseEntity
{
    public Guid LecturerProfileId { get; set; }
    public bool EmailAlerts { get; set; }
    public bool StudentRiskAlerts { get; set; }
    public bool AssignmentReminders { get; set; }
    public bool WeeklyReports { get; set; }

    public LecturerProfile? LecturerProfile { get; set; }
}
