using GapSense.Application.DTOs.Responses;
using GapSense.Domain.Entities;

namespace GapSense.Application.Mappings;

public static class StudentMonitoringMappings
{
    public static StudentProfileListItemResponse ToListItem(this StudentProfile e) =>
        new(
            e.Id,
            e.StudentId,
            e.FullName,
            e.Email,
            e.CurrentModule,
            e.RiskLevel,
            e.RiskScore,
            (e.WeakTopics ?? [])
                .Where(w => w.IsActive)
                .OrderByDescending(w => w.CreatedAt)
                .Select(w => w.TopicName)
                .ToList(),
            e.IsActive,
            e.CreatedAt,
            e.UpdatedAt
        );

    public static StudentMonitoringDetailsResponse ToDetails(this StudentProfile e) =>
        new(
            e.Id,
            e.StudentId,
            e.FullName,
            e.Email,
            e.Phone,
            e.Batch,
            e.Year,
            e.EnrolledSemester.Name,
            e.DegreeProgram,
            e.Gpa,
            e.AttendancePercentage,
            e.RecentAssessmentScore,
            e.RiskScore,
            e.RiskLevel,
            e.PerformanceTrend,
            e.CurrentModule,
            e.IsActive,
            (e.WeakTopics ?? []).Where(w => w.IsActive).OrderByDescending(w => w.CreatedAt).Select(w => w.ToWeakTopicResponse()).ToList(),
            (e.InterventionAssignments ?? []).Where(i => i.IsActive).OrderByDescending(i => i.CreatedAt).Select(i => i.ToInterventionResponse()).ToList(),
            (e.MonitoringNotes ?? []).Where(n => n.IsActive).OrderByDescending(n => n.CreatedAt).Select(n => n.ToNoteResponse()).ToList(),
            (e.Meetings ?? []).Where(m => m.IsActive).OrderByDescending(m => m.ScheduledDate).Select(m => m.ToMeetingResponse()).ToList(),
            (e.Referrals ?? []).Where(r => r.IsActive).OrderByDescending(r => r.CreatedAt).Select(r => r.ToReferralResponse()).ToList()
        );

    public static WeakTopicResponse ToWeakTopicResponse(this WeakTopicAnalysis w) =>
        new(w.Id, w.TopicName, w.Severity, w.Notes, w.CreatedAt);

    public static InterventionAssignmentResponse ToInterventionResponse(this InterventionAssignment i) =>
        new(
            i.Id,
            i.AssignedToName,
            i.AssignedToRole,
            i.InterventionType,
            i.Priority,
            i.Note,
            i.DueDate,
            i.FollowUpDate,
            i.Status,
            i.IsActive,
            i.CreatedAt,
            i.UpdatedAt
        );

    public static MonitoringNoteResponse ToNoteResponse(this MonitoringNote n) =>
        new(n.Id, n.NoteType, n.NoteText, n.AddedBy, n.CreatedAt);

    public static MeetingResponse ToMeetingResponse(this MeetingOrFollowUp m) =>
        new(m.Id, m.Title, m.Description, m.ScheduledDate, m.MeetingType, m.Status, m.CreatedBy, m.IsActive, m.CreatedAt, m.UpdatedAt);

    public static ReferralResponse ToReferralResponse(this ReferralOrEscalation r) =>
        new(r.Id, r.ReferralType, r.ReferredTo, r.Reason, r.Status, r.CreatedBy, r.IsActive, r.CreatedAt, r.UpdatedAt);
}
