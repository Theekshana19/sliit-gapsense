using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Domain.Entities;

namespace GapSense.Application.Services;

public sealed class DashboardService : IDashboardService
{
    private static readonly string[] TrendLabels = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL"];

    private readonly IStudentProfileRepository _students;
    private readonly IReadinessResultRepository _readiness;
    private readonly ISemesterRepository _semesters;
    private readonly IFollowUpTaskService _followUps;

    public DashboardService(
        IStudentProfileRepository students,
        IReadinessResultRepository readiness,
        ISemesterRepository semesters,
        IFollowUpTaskService followUps)
    {
        _students = students;
        _readiness = readiness;
        _semesters = semesters;
        _followUps = followUps;
    }

    public Task<DashboardSummaryResponse> GetSummaryAsync(Guid? semesterId, CancellationToken ct) =>
        BuildSummaryAsync(semesterId, ct);

    public async Task<DashboardReadinessTrendResponse> GetReadinessTrendAsync(Guid? semesterId, CancellationToken ct)
    {
        var sid = await ResolveSemesterIdAsync(semesterId, ct);
        var points = (await _readiness.ListForTrendBySemesterAsync(sid, ct)).ToList();
        var cy = DateTime.UtcNow.Year;
        var py = cy - 1;
        var list = new List<DashboardReadinessTrendPointResponse>(TrendLabels.Length);
        for (var i = 0; i < TrendLabels.Length; i++)
        {
            var month = i + 1;
            var cur = AverageReadinessForMonth(points, cy, month);
            var prev = AverageReadinessForMonth(points, py, month);
            list.Add(new DashboardReadinessTrendPointResponse(TrendLabels[i], cur, prev));
        }

        return new DashboardReadinessTrendResponse(cy, py, list);
    }

    public async Task<DashboardRiskDistributionResponse> GetRiskDistributionAsync(Guid? semesterId, CancellationToken ct)
    {
        var sid = await ResolveSemesterIdAsync(semesterId, ct);
        var profiles = (await _students.ListActiveBySemesterIdAsync(sid, ct)).ToList();
        var critical = profiles.Count(p => string.Equals(p.RiskLevel, "critical", StringComparison.OrdinalIgnoreCase));
        var moderate = profiles.Count(p => string.Equals(p.RiskLevel, "moderate", StringComparison.OrdinalIgnoreCase));
        var low = profiles.Count(p => string.Equals(p.RiskLevel, "low", StringComparison.OrdinalIgnoreCase));
        var total = profiles.Count;
        var atRisk = critical + moderate;

        if (total == 0)
        {
            return new DashboardRiskDistributionResponse(0,
            [
                new DashboardRiskSliceResponse("Critical Risk", 0, 0),
                new DashboardRiskSliceResponse("Elevated Risk", 0, 0),
                new DashboardRiskSliceResponse("Stable", 0, 0),
            ]);
        }

        decimal P(int n) => Math.Round(100m * n / total, 1);
        var slices = new[]
        {
            new DashboardRiskSliceResponse("Critical Risk", critical, P(critical)),
            new DashboardRiskSliceResponse("Elevated Risk", moderate, P(moderate)),
            new DashboardRiskSliceResponse("Stable", low, P(low)),
        };
        return new DashboardRiskDistributionResponse(atRisk, slices);
    }

    public async Task<DashboardFullResponse> GetFullAsync(Guid? semesterId, CancellationToken ct)
    {
        var summary = await BuildSummaryAsync(semesterId, ct);
        var trend = await GetReadinessTrendAsync(semesterId, ct);
        var risk = await GetRiskDistributionAsync(semesterId, ct);
        var milestones = await BuildMilestonesAsync(semesterId, ct);
        var (followUp, followUpErr) = await TryBuildFollowUpQueueAsync(summary.SemesterId, ct);
        return new DashboardFullResponse(summary, trend, risk, milestones, DateTime.UtcNow, followUp, followUpErr);
    }

    private async Task<(FollowUpQueueResponse Queue, string? Error)> TryBuildFollowUpQueueAsync(Guid semesterId, CancellationToken ct)
    {
        try
        {
            var q = await _followUps.GetQueueAsync(semesterId, ct);
            return (q, null);
        }
        catch (Exception ex)
        {
            var msg = ex.GetBaseException().Message;
            var hint = msg.Contains("Invalid object name", StringComparison.OrdinalIgnoreCase)
                       && msg.Contains("FollowUpTasks", StringComparison.OrdinalIgnoreCase)
                ? "Run EF migration: from GapSense.API execute dotnet ef database update --project ..\\GapSense.Infrastructure --startup-project ."
                : "Rebuild and restart the API; ensure SQL Server is reachable and migrations are applied.";
            return (
                new FollowUpQueueResponse(0, "No pending follow-up items for this semester.", []),
                $"Follow-up queue could not be loaded. {hint} ({msg})");
        }
    }

    private async Task<DashboardSummaryResponse> BuildSummaryAsync(Guid? semesterId, CancellationToken ct)
    {
        var sid = await ResolveSemesterIdAsync(semesterId, ct);
        var semester = await _semesters.GetByIdAsync(sid, ct)
            ?? throw new ArgumentException("The selected semester was not found.");
        var profiles = (await _students.ListActiveBySemesterIdAsync(sid, ct)).ToList();

        var total = profiles.Count;
        var activeModules = profiles
            .Select(p => p.CurrentModule.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Count();
        var highRisk = profiles.Count(p => !string.Equals(p.RiskLevel, "low", StringComparison.OrdinalIgnoreCase));
        var avgReadiness = total == 0
            ? 0
            : Math.Round((decimal)profiles.Average(p => (double)p.ReadinessScore), 1);

        var orderedSemesters = (await _semesters.ListActiveOrderedAsync(ct)).ToList();
        var idx = orderedSemesters.FindIndex(s => s.Id == sid);
        Semester? prevSemester = idx >= 0 && idx + 1 < orderedSemesters.Count ? orderedSemesters[idx + 1] : null;

        string? totalNote = null;
        string? riskNote = null;
        if (prevSemester is not null)
        {
            var prevProfiles = (await _students.ListActiveBySemesterIdAsync(prevSemester.Id, ct)).ToList();
            var prevTotal = prevProfiles.Count;
            if (prevTotal > 0 && total > 0)
            {
                var delta = Math.Round(100m * (total - prevTotal) / prevTotal, 1);
                totalNote = delta >= 0 ? $"+{delta}% vs prior term" : $"{delta}% vs prior term";
            }

            var prevRisk = prevProfiles.Count(p => !string.Equals(p.RiskLevel, "low", StringComparison.OrdinalIgnoreCase));
            if (prevRisk > 0 && highRisk >= 0)
            {
                var rDelta = Math.Round(100m * (highRisk - prevRisk) / prevRisk, 1);
                riskNote = rDelta >= 0 ? $"+{rDelta}%" : $"{rDelta}%";
            }
        }

        return new DashboardSummaryResponse(
            sid,
            semester.Name,
            total,
            activeModules,
            highRisk,
            avgReadiness,
            totalNote ?? "+12% vs LY",
            riskNote ?? "-4.2%",
            "Target: 85%");
    }

    private async Task<IReadOnlyList<DashboardMilestoneResponse>> BuildMilestonesAsync(Guid? semesterId, CancellationToken ct)
    {
        var sid = await ResolveSemesterIdAsync(semesterId, ct);
        var profiles = (await _students.ListActiveBySemesterIdAsync(sid, ct)).ToList();
        return profiles
            .OrderByDescending(p => p.UpdatedAt ?? p.CreatedAt)
            .Take(12)
            .Select(ToMilestone)
            .ToList();
    }

    private static DashboardMilestoneResponse ToMilestone(StudentProfile p)
    {
        var prev = (int)Math.Round(p.RecentAssessmentScore);
        var curr = (int)Math.Round(p.ReadinessScore);
        var (label, tone) = ClassifyMilestone(p, prev, curr);
        return new DashboardMilestoneResponse(
            p.Id,
            Initials(p.FullName),
            p.FullName,
            p.StudentId,
            p.CurrentModule,
            prev,
            curr,
            label,
            tone);
    }

    private static (string Label, string Tone) ClassifyMilestone(StudentProfile p, int prev, int curr)
    {
        if (string.Equals(p.RiskLevel, "critical", StringComparison.OrdinalIgnoreCase))
        {
            return ("HIGH RISK", "danger");
        }

        if (curr > prev + 5)
        {
            return ("IMPROVED", "success");
        }

        if (curr < prev - 5)
        {
            return ("DECLINED", "danger");
        }

        return ("STABLE", "neutral");
    }

    private static string Initials(string fullName)
    {
        var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0)
        {
            return "?";
        }

        if (parts.Length == 1)
        {
            return parts[0].Length >= 2 ? parts[0][..2].ToUpperInvariant() : parts[0].ToUpperInvariant();
        }

        return string.Concat(parts[0][0], parts[^1][0]).ToUpperInvariant();
    }

    private static decimal AverageReadinessForMonth(IReadOnlyList<ReadinessResult> points, int year, int month)
    {
        var subset = points.Where(r => r.CreatedAt.Year == year && r.CreatedAt.Month == month).ToList();
        if (subset.Count == 0)
        {
            return 0;
        }

        return (decimal)Math.Round(subset.Average(r => (double)r.ReadinessScore), 1);
    }

    private async Task<Guid> ResolveSemesterIdAsync(Guid? semesterId, CancellationToken ct)
    {
        if (semesterId is { } id && id != Guid.Empty)
        {
            var sem = await _semesters.GetByIdAsync(id, ct);
            if (sem is null)
            {
                throw new ArgumentException("The selected semester was not found.");
            }

            return id;
        }

        var current = await _semesters.GetCurrentAsync(ct);
        if (current is null)
        {
            throw new ArgumentException("No current semester is configured. Select a semester or run database seeding.");
        }

        return current.Id;
    }
}
