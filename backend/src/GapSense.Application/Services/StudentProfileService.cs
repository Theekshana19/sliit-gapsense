using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Application.Mappings;
using GapSense.Domain.Entities;

namespace GapSense.Application.Services;

public sealed class StudentProfileService : IStudentProfileService
{
    private readonly IStudentProfileRepository _repo;
    private readonly IInterventionAssignmentRepository _interventions;
    private readonly IRecommendationRuleRepository _rules;
    private readonly ISemesterRepository _semesters;
    private readonly INotificationFeedService _notifications;

    public StudentProfileService(
        IStudentProfileRepository repo,
        IInterventionAssignmentRepository interventions,
        IRecommendationRuleRepository rules,
        ISemesterRepository semesters,
        INotificationFeedService notifications)
    {
        _repo = repo;
        _interventions = interventions;
        _rules = rules;
        _semesters = semesters;
        _notifications = notifications;
    }

    public async Task<IReadOnlyList<StudentProfileListItemResponse>> ListAsync(CancellationToken ct)
    {
        var list = await _repo.ListActiveForMonitoringAsync(ct);
        return list.Select(x => x.ToListItem()).ToList();
    }

    public async Task<StudentProfileListItemResponse?> GetAsync(Guid id, CancellationToken ct)
    {
        var e = await _repo.GetActiveByIdAsync(id, ct);
        return e?.ToListItem();
    }

    public async Task<StudentMonitoringDetailsResponse?> GetDetailsAsync(Guid id, CancellationToken ct)
    {
        var e = await _repo.GetActiveWithDetailsAsync(id, ct);
        return e?.ToDetails();
    }

    public async Task<MonitoringSummaryResponse> GetMonitoringSummaryAsync(CancellationToken ct)
    {
        var profiles = (await _repo.ListActiveForMonitoringAsync(ct)).ToList();
        var critical = profiles.Count(p => string.Equals(p.RiskLevel, "critical", StringComparison.OrdinalIgnoreCase));
        var pipeline = await _interventions.CountActivePipelineAsync(ct);
        var recovered = profiles.Count(p => string.Equals(p.RiskLevel, "low", StringComparison.OrdinalIgnoreCase));
        var highRisk = profiles.Count(p => !string.Equals(p.RiskLevel, "low", StringComparison.OrdinalIgnoreCase));
        var successRate = profiles.Count == 0
            ? 0
            : Math.Round((decimal)recovered / profiles.Count * 100, 1);

        var moduleBars = profiles
            .GroupBy(p => p.CurrentModule)
            .Select(g =>
            {
                var avg = (decimal)g.Average(x => (double)x.RiskScore);
                var pct = Math.Min(100, Math.Round(avg, 1));
                return new ModuleRiskBarResponse(g.Key, pct, pct >= 15);
            })
            .OrderByDescending(b => b.Pct)
            .Take(8)
            .ToList();

        var ruleList = await _rules.ListAsync(ct);
        var suggestions = ruleList
            .Where(r => r.IsActive)
            .Take(2)
            .Select(r => new SuggestedInterventionResponse(r.RuleName, r.ActionText))
            .ToList();
        if (suggestions.Count == 0)
        {
            suggestions =
            [
                new SuggestedInterventionResponse(
                    "DSA Focused Lab Session",
                    "Targeting cohort weak spots in graph and tree structures."),
                new SuggestedInterventionResponse(
                    "Supplemental SQL Workshop",
                    "Mandatory workshop for students below readiness threshold in database modules."),
            ];
        }

        return new MonitoringSummaryResponse(
            critical,
            pipeline,
            recovered,
            successRate,
            moduleBars,
            suggestions,
            highRisk);
    }

    public async Task<StudentProfileListItemResponse> CreateAsync(CreateStudentProfileRequest request, CancellationToken ct)
    {
        var sid = request.StudentId.Trim().ToUpperInvariant();
        if (await _repo.StudentIdExistsAsync(sid, null, ct))
        {
            throw new ArgumentException("Student ID already exists.");
        }

        var semester = await _semesters.GetByIdAsync(request.SemesterId, ct)
            ?? throw new ArgumentException("SemesterId does not match an active semester.");
        var entity = new StudentProfile
        {
            StudentId = sid,
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
            Batch = request.Batch.Trim(),
            Year = request.Year,
            SemesterId = semester.Id,
            DegreeProgram = request.DegreeProgram.Trim(),
            Gpa = request.Gpa,
            AttendancePercentage = request.AttendancePercentage,
            RecentAssessmentScore = request.RecentAssessmentScore,
            ReadinessScore = request.ReadinessScore,
            RiskScore = request.RiskScore,
            RiskLevel = NormalizeRiskLevel(request.RiskLevel),
            PerformanceTrend = request.PerformanceTrend.Trim().ToLowerInvariant(),
            CurrentModule = request.CurrentModule.Trim(),
            IsActive = true,
        };
        await _repo.AddAsync(entity, ct);
        var reloaded = await _repo.GetActiveByIdAsync(entity.Id, ct) ?? entity;
        return reloaded.ToListItem();
    }

    public async Task<StudentProfileListItemResponse?> UpdateAsync(Guid id, UpdateStudentProfileRequest request, CancellationToken ct)
    {
        var entity = await _repo.GetTrackedActiveByIdAsync(id, ct);
        if (entity is null) return null;

        var wasCritical = string.Equals(entity.RiskLevel, "critical", StringComparison.OrdinalIgnoreCase);
        var wasLowAttendance = entity.AttendancePercentage < 75m;

        var sid = request.StudentId.Trim().ToUpperInvariant();
        if (await _repo.StudentIdExistsAsync(sid, id, ct))
        {
            throw new ArgumentException("Student ID already exists.");
        }

        entity.StudentId = sid;
        entity.FullName = request.FullName.Trim();
        entity.Email = request.Email.Trim().ToLowerInvariant();
        entity.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        entity.Batch = request.Batch.Trim();
        entity.Year = request.Year;
        var semester = await _semesters.GetByIdAsync(request.SemesterId, ct)
            ?? throw new ArgumentException("SemesterId does not match an active semester.");
        entity.SemesterId = semester.Id;
        entity.DegreeProgram = request.DegreeProgram.Trim();
        entity.Gpa = request.Gpa;
        entity.AttendancePercentage = request.AttendancePercentage;
        entity.RecentAssessmentScore = request.RecentAssessmentScore;
        entity.ReadinessScore = request.ReadinessScore;
        entity.RiskScore = request.RiskScore;
        entity.RiskLevel = NormalizeRiskLevel(request.RiskLevel);
        entity.PerformanceTrend = request.PerformanceTrend.Trim().ToLowerInvariant();
        entity.CurrentModule = request.CurrentModule.Trim();
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repo.UpdateAsync(entity, ct);
        var reloaded = await _repo.GetActiveByIdAsync(id, ct);

        // Event-driven notifications for monitoring changes (settings are enforced in NotificationFeedService).
        if (reloaded is not null)
        {
            var isCritical = string.Equals(reloaded.RiskLevel, "critical", StringComparison.OrdinalIgnoreCase);
            var isLowAttendance = reloaded.AttendancePercentage < 75m;

            if (!wasCritical && isCritical)
            {
                await _notifications.PublishAsync(
                    new PublishNotificationRequest(
                        "risk",
                        $"student-risk-{reloaded.Id}",
                        "High-risk student detected",
                        $"{reloaded.FullName} ({reloaded.StudentId}) is currently flagged as high risk.",
                        "/readiness/overview"),
                    ct);
            }

            if (!wasLowAttendance && isLowAttendance)
            {
                await _notifications.PublishAsync(
                    new PublishNotificationRequest(
                        "risk",
                        $"attendance-low-{reloaded.Id}",
                        "Low attendance warning",
                        $"{reloaded.FullName} attendance dropped to {reloaded.AttendancePercentage:0.#}%.",
                        "/readiness/overview"),
                    ct);
            }
        }

        return reloaded?.ToListItem();
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var entity = await _repo.GetTrackedActiveByIdAsync(id, ct);
        if (entity is null) return false;
        entity.IsActive = false;
        entity.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(entity, ct);
        return true;
    }

    private static string NormalizeRiskLevel(string riskLevel)
    {
        var v = riskLevel.Trim().ToLowerInvariant();
        return v switch
        {
            "critical" or "moderate" or "low" => v,
            _ => v,
        };
    }
}
