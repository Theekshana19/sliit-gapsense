namespace GapSense.Application.DTOs.Requests;

public sealed record CreateStudentProfileRequest(
    string StudentId,
    string FullName,
    string Email,
    string? Phone,
    string Batch,
    int Year,
    Guid SemesterId,
    string DegreeProgram,
    decimal Gpa,
    decimal AttendancePercentage,
    decimal RecentAssessmentScore,
    decimal ReadinessScore,
    decimal RiskScore,
    string RiskLevel,
    string PerformanceTrend,
    string CurrentModule
);
