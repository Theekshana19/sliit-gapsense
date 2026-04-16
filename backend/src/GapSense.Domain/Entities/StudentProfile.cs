using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

public sealed class StudentProfile : BaseEntity
{
    public required string StudentId { get; set; }
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public string? Phone { get; set; }
    public required string Batch { get; set; }
    public int Year { get; set; }
    public Guid SemesterId { get; set; }
    public Semester EnrolledSemester { get; set; } = null!;
    public required string DegreeProgram { get; set; }
    public decimal Gpa { get; set; }
    public decimal AttendancePercentage { get; set; }
    public decimal RecentAssessmentScore { get; set; }
    /// <summary>Holistic readiness 0–100 for dashboard analytics.</summary>
    public decimal ReadinessScore { get; set; }
    public decimal RiskScore { get; set; }
    public required string RiskLevel { get; set; }
    public required string PerformanceTrend { get; set; }
    public required string CurrentModule { get; set; }

    public ICollection<WeakTopicAnalysis> WeakTopics { get; set; } = new List<WeakTopicAnalysis>();
    public ICollection<InterventionAssignment> InterventionAssignments { get; set; } = new List<InterventionAssignment>();
    public ICollection<MonitoringNote> MonitoringNotes { get; set; } = new List<MonitoringNote>();
    public ICollection<MeetingOrFollowUp> Meetings { get; set; } = new List<MeetingOrFollowUp>();
    public ICollection<ReferralOrEscalation> Referrals { get; set; } = new List<ReferralOrEscalation>();
    public ICollection<FollowUpTask> FollowUpTasks { get; set; } = new List<FollowUpTask>();
}
