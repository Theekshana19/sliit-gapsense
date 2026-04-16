using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using InterventionPlanEntity = GapSense.Domain.Entities.InterventionPlan;

namespace GapSense.Application.Services;

public sealed class InterventionPlanningService : IInterventionPlanningService
{
    private readonly IInterventionPlanRepository _plans;
    private readonly IStudentProfileRepository _students;
    private readonly IAcademicModuleRepository _modules;
    private readonly INotificationFeedService _notifications;

    public InterventionPlanningService(
        IInterventionPlanRepository plans,
        IStudentProfileRepository students,
        IAcademicModuleRepository modules,
        INotificationFeedService notifications)
    {
        _plans = plans;
        _students = students;
        _modules = modules;
        _notifications = notifications;
    }

    public async Task<IReadOnlyList<InterventionPlanTableRowResponse>> ListActiveAsync(CancellationToken ct)
    {
        var list = await _plans.ListActiveAsync(ct);
        return list.Select(ToRow).ToList();
    }

    public async Task<IReadOnlyList<InterventionPlanTableRowResponse>> SearchAsync(
        InterventionPlansSearchRequest request,
        CancellationToken ct)
    {
        var rows = await ListActiveAsync(ct);
        var q = request.Query?.Trim().ToLowerInvariant();
        if (string.IsNullOrEmpty(q))
        {
            return rows;
        }

        return rows.Where(r => RowMatches(r, q)).ToList();
    }

    public async Task<InterventionPlanTableRowResponse?> GetAsync(Guid id, CancellationToken ct)
    {
        var p = await _plans.GetActiveByIdAsync(id, ct);
        return p is null ? null : ToRow(p);
    }

    public async Task<InterventionPlanTableRowResponse> CreateAsync(CreateInterventionPlanRequest request, CancellationToken ct)
    {
        var moduleCode = request.ModuleCode.Trim().ToUpperInvariant();
        var batch = request.Batch.Trim();
        if (!await _modules.ExistsByCodeAsync(moduleCode, ct))
        {
            throw new ArgumentException("ModuleCode does not match an active academic module.");
        }

        if (!await _students.BatchExistsAsync(batch, ct))
        {
            throw new ArgumentException("Batch does not match an active student intake.");
        }

        if (request.StudentProfileId.HasValue)
        {
            var student = await _students.GetActiveByIdAsync(request.StudentProfileId.Value, ct);
            if (student is null)
            {
                throw new ArgumentException("StudentProfileId does not match an active student profile.");
            }
        }

        var entity = new InterventionPlanEntity
        {
            ModuleCode = moduleCode,
            Batch = batch,
            RiskGroup = request.RiskGroup.Trim().ToLowerInvariant(),
            WeakTopic = request.WeakTopic.Trim(),
            InterventionType = request.InterventionType.Trim().ToLowerInvariant(),
            PlannedDate = request.PlannedDate,
            Status = request.Status.Trim().ToLowerInvariant(),
            AssignedLecturer = string.IsNullOrWhiteSpace(request.AssignedLecturer) ? null : request.AssignedLecturer.Trim(),
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            StudentProfileId = request.StudentProfileId,
            IsDraft = request.IsDraft,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        await _plans.AddAsync(entity, ct);

        // Event-driven notification (in addition to pull-time syncing).
        await _notifications.PublishAsync(
            new PublishNotificationRequest(
                "reminder",
                $"intervention-created-{entity.Id}",
                "Intervention scheduled",
                $"{entity.InterventionType} for {entity.ModuleCode} ({entity.Batch}) on {entity.PlannedDate:yyyy-MM-dd}.",
                "/monitoring/plans"),
            ct);

        return ToRow(entity);
    }

    public async Task<bool> SoftDeleteAsync(Guid id, CancellationToken ct)
    {
        var entity = await _plans.GetTrackedByIdAsync(id, ct);
        if (entity is null || !entity.IsActive)
        {
            return false;
        }

        entity.IsActive = false;
        entity.UpdatedAt = DateTime.UtcNow;
        await _plans.UpdateAsync(entity, ct);
        return true;
    }

    public async Task<InterventionPlanningDashboardResponse> GetDashboardAsync(CancellationToken ct)
    {
        var plans = await _plans.ListActiveAsync(ct);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var completedReviews = plans
            .SelectMany(p => p.Reviews ?? [])
            .Where(r => r.IsActive && r.IsCompleted)
            .ToList();

        decimal successPct;
        string successSummary;
        if (completedReviews.Count == 0)
        {
            successPct = 0;
            successSummary = "No completed intervention reviews yet. Success rate uses average improvement % from completed reviews.";
        }
        else
        {
            successPct = Math.Round((decimal)completedReviews.Average(r => (double)r.ImprovementPercentage), 1, MidpointRounding.AwayFromZero);
            successSummary =
                "Average improvement rate for students who completed a scheduled intervention module this semester (from recorded reviews).";
        }

        var unassignedHigh = plans.Count(p =>
            string.Equals(p.RiskGroup, "high", StringComparison.OrdinalIgnoreCase) &&
            string.IsNullOrWhiteSpace(p.AssignedLecturer));
        var unassignedOther = plans.Count(p =>
            !string.Equals(p.RiskGroup, "high", StringComparison.OrdinalIgnoreCase) &&
            string.IsNullOrWhiteSpace(p.AssignedLecturer));
        var overdue = plans.Count(p =>
            !string.Equals(p.Status, "completed", StringComparison.OrdinalIgnoreCase) && p.PlannedDate < today);

        var lines = new List<string>();
        if (unassignedHigh > 0)
        {
            lines.Add($"{unassignedHigh} High-Risk plans require lecturer assignment");
        }

        if (unassignedOther > 0)
        {
            lines.Add($"{unassignedOther} additional plan(s) still need a lecturer assignment");
        }

        if (overdue > 0)
        {
            lines.Add($"{overdue} Follow-ups past their scheduled review date");
        }

        if (lines.Count == 0)
        {
            lines.Add("No outstanding pending items for the current cohort plans.");
        }

        var pendingTotal = unassignedHigh + unassignedOther + overdue;
        return new InterventionPlanningDashboardResponse(successPct, successSummary, pendingTotal, lines);
    }

    private static bool RowMatches(InterventionPlanTableRowResponse r, string q)
    {
        var haystack = string.Join(' ', r.ModuleCode, r.Batch, r.RiskGroup, r.WeakTopic, r.InterventionType, r.PlannedDate, r.Status, r.AssignedLecturer ?? "", r.Notes ?? "")
            .ToLowerInvariant();
        return haystack.Contains(q);
    }

    private static InterventionPlanTableRowResponse ToRow(InterventionPlanEntity p) =>
        new(
            p.Id,
            p.ModuleCode,
            p.Batch,
            p.RiskGroup,
            p.WeakTopic,
            p.InterventionType,
            p.PlannedDate.ToString("yyyy-MM-dd"),
            p.Status,
            p.AssignedLecturer,
            p.Notes,
            p.IsDraft);
}
