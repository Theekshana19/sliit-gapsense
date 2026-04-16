namespace GapSense.Application.DTOs.Responses;

public sealed record WeakTopicResponse(
    Guid Id,
    string TopicName,
    string Severity,
    string? Notes,
    DateTime CreatedAt
);

public sealed record InterventionAssignmentResponse(
    Guid Id,
    string AssignedToName,
    string AssignedToRole,
    string InterventionType,
    string Priority,
    string? Note,
    DateTime DueDate,
    DateTime? FollowUpDate,
    string Status,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public sealed record MonitoringNoteResponse(
    Guid Id,
    string NoteType,
    string NoteText,
    string AddedBy,
    DateTime CreatedAt
);

public sealed record MeetingResponse(
    Guid Id,
    string Title,
    string? Description,
    DateTime ScheduledDate,
    string MeetingType,
    string Status,
    string CreatedBy,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public sealed record ReferralResponse(
    Guid Id,
    string ReferralType,
    string ReferredTo,
    string Reason,
    string Status,
    string CreatedBy,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public sealed record StudentMonitoringDetailsResponse(
    Guid Id,
    string StudentId,
    string FullName,
    string Email,
    string? Phone,
    string Batch,
    int Year,
    string Semester,
    string DegreeProgram,
    decimal Gpa,
    decimal AttendancePercentage,
    decimal RecentAssessmentScore,
    decimal RiskScore,
    string RiskLevel,
    string PerformanceTrend,
    string CurrentModule,
    bool IsActive,
    IReadOnlyList<WeakTopicResponse> WeakTopics,
    IReadOnlyList<InterventionAssignmentResponse> Interventions,
    IReadOnlyList<MonitoringNoteResponse> Notes,
    IReadOnlyList<MeetingResponse> Meetings,
    IReadOnlyList<ReferralResponse> Referrals
);
