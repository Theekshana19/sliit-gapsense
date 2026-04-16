using System.Globalization;
using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Domain.Entities;
using GapSense.Domain.Enums;

namespace GapSense.Application.Services;

public sealed class NotificationFeedService : INotificationFeedService
{
    private readonly ILecturerProfileRepository _profiles;
    private readonly ILecturerNotificationSettingsRepository _settings;
    private readonly INotificationFeedRepository _notifications;
    private readonly IStudentProfileRepository _students;
    private readonly ISemesterRepository _semesters;
    private readonly IFollowUpTaskRepository _followUps;
    private readonly IInterventionPlanRepository _plans;
    private readonly IReportExportRepository _exports;

    public NotificationFeedService(
        ILecturerProfileRepository profiles,
        ILecturerNotificationSettingsRepository settings,
        INotificationFeedRepository notifications,
        IStudentProfileRepository students,
        ISemesterRepository semesters,
        IFollowUpTaskRepository followUps,
        IInterventionPlanRepository plans,
        IReportExportRepository exports)
    {
        _profiles = profiles;
        _settings = settings;
        _notifications = notifications;
        _students = students;
        _semesters = semesters;
        _followUps = followUps;
        _plans = plans;
        _exports = exports;
    }

    public async Task<IReadOnlyList<NotificationFeedItemResponse>> GetRecentAsync(int take, CancellationToken ct)
    {
        var state = await EnsureStateAsync(ct);
        await SyncFromRealDataAsync(state.Profile, state.Settings, ct);
        var items = await _notifications.GetRecentAsync(state.Profile.Id, take, ct);
        return items.Select(ToDto).ToList();
    }

    public async Task<int> GetUnreadCountAsync(CancellationToken ct)
    {
        var state = await EnsureStateAsync(ct);
        await SyncFromRealDataAsync(state.Profile, state.Settings, ct);
        return await _notifications.GetUnreadCountAsync(state.Profile.Id, ct);
    }

    public async Task MarkReadAsync(Guid id, CancellationToken ct)
    {
        var state = await EnsureStateAsync(ct);
        var item = await _notifications.GetByIdAsync(state.Profile.Id, id, ct)
            ?? throw new KeyNotFoundException("Notification was not found.");
        if (item.ReadAtUtc is null)
        {
            item.ReadAtUtc = DateTime.UtcNow;
            item.UpdatedAt = DateTime.UtcNow;
            await _notifications.UpdateAsync(item, ct);
        }
    }

    public async Task MarkAllReadAsync(CancellationToken ct)
    {
        var state = await EnsureStateAsync(ct);
        await _notifications.MarkAllReadAsync(state.Profile.Id, ct);
    }

    public async Task ClearAllAsync(CancellationToken ct)
    {
        var state = await EnsureStateAsync(ct);
        await _notifications.ClearAllAsync(state.Profile.Id, ct);
    }

    public async Task PublishAsync(PublishNotificationRequest request, CancellationToken ct)
    {
        if (request is null) throw new ArgumentNullException(nameof(request));
        var state = await EnsureStateAsync(ct);
        if (!IsEnabledBySettings(request.Type, state.Settings))
        {
            return;
        }

        await UpsertAsync(
            state.Profile.Id,
            request.Type,
            request.SourceKey.Trim(),
            request.Title.Trim(),
            request.Message.Trim(),
            string.IsNullOrWhiteSpace(request.Route) ? null : request.Route.Trim(),
            ct);
    }

    private async Task SyncFromRealDataAsync(LecturerProfile profile, LecturerNotificationSettings settings, CancellationToken ct)
    {
        if (settings.StudentRiskAlerts)
        {
            var students = await _students.ListActiveForMonitoringAsync(ct);
            foreach (var s in students.Where(x => string.Equals(x.RiskLevel, "critical", StringComparison.OrdinalIgnoreCase)).Take(20))
            {
                await UpsertAsync(profile.Id, "risk", $"student-risk-{s.Id}",
                    "High-risk student detected",
                    $"{s.FullName} ({s.StudentId}) is currently flagged as high risk.",
                    "/readiness/overview", ct);
            }

            foreach (var s in students.Where(x => x.AttendancePercentage < 75m).Take(20))
            {
                await UpsertAsync(profile.Id, "risk", $"attendance-low-{s.Id}",
                    "Low attendance warning",
                    $"{s.FullName} attendance dropped to {s.AttendancePercentage.ToString("0.#", CultureInfo.InvariantCulture)}%.",
                    "/readiness/overview", ct);
            }
        }

        if (settings.AssignmentReminders)
        {
            var currentSemester = await _semesters.GetCurrentAsync(ct);
            if (currentSemester is not null)
            {
                var followUps = await _followUps.ListForSemesterAsync(currentSemester.Id, ct);
                foreach (var f in followUps.Where(x => x.IsActive && !x.IsDismissed && x.DueDate.Date < DateTime.UtcNow.Date && x.Status != FollowUpStatus.Completed).Take(20))
                {
                    await UpsertAsync(profile.Id, "reminder", $"followup-overdue-{f.Id}",
                        "Follow-up overdue",
                        $"{f.Title} is overdue since {f.DueDate:yyyy-MM-dd}.",
                        "/monitoring/follow-ups", ct);
                }
            }

            var plans = await _plans.ListActiveAsync(ct);
            foreach (var p in plans.Where(x => x.IsActive && x.PlannedDate >= DateOnly.FromDateTime(DateTime.Today) && x.PlannedDate <= DateOnly.FromDateTime(DateTime.Today.AddDays(7))).Take(20))
            {
                await UpsertAsync(profile.Id, "reminder", $"intervention-plan-{p.Id}",
                    "Intervention scheduled",
                    $"{p.InterventionType} for {p.ModuleCode} ({p.Batch}) on {p.PlannedDate:yyyy-MM-dd}.",
                    "/monitoring/plans", ct);
            }
        }

        if (settings.WeeklyReports)
        {
            var exports = await _exports.GetRecentAsync(10, ct);
            foreach (var e in exports.Where(x => x.IsActive))
            {
                await UpsertAsync(profile.Id, "system", $"report-export-{e.Id}",
                    "Report generated",
                    $"{e.ReportType} ({e.Format.ToUpperInvariant()}) is ready to download.",
                    "/risk-analysis/reports", ct);
            }
        }
    }

    private static bool IsEnabledBySettings(string type, LecturerNotificationSettings settings) =>
        type.Trim().ToLowerInvariant() switch
        {
            "risk" => settings.StudentRiskAlerts,
            "reminder" => settings.AssignmentReminders,
            "system" => settings.WeeklyReports,
            _ => true,
        };

    private async Task UpsertAsync(Guid lecturerProfileId, string type, string sourceKey, string title, string message, string? route, CancellationToken ct)
    {
        var existing = await _notifications.GetBySourceAsync(lecturerProfileId, "notification", sourceKey, ct);
        if (existing is not null)
        {
            var changed = false;
            if (!existing.IsActive)
            {
                existing.IsActive = true;
                existing.ReadAtUtc = null;
                existing.CreatedAt = DateTime.UtcNow;
                changed = true;
            }
            if (!string.Equals(existing.Message, message, StringComparison.Ordinal))
            {
                existing.Message = message;
                changed = true;
            }
            if (changed)
            {
                existing.UpdatedAt = DateTime.UtcNow;
                await _notifications.UpdateAsync(existing, ct);
            }
            return;
        }

        await _notifications.AddAsync(new NotificationFeedItem
        {
            LecturerProfileId = lecturerProfileId,
            Type = type,
            Title = title,
            Message = message,
            Route = route,
            SourceType = "notification",
            SourceKey = sourceKey
        }, ct);
    }

    private async Task<(LecturerProfile Profile, LecturerNotificationSettings Settings)> EnsureStateAsync(CancellationToken ct)
    {
        var profile = await _profiles.GetDefaultActiveAsync(ct);
        if (profile is null)
        {
            profile = new LecturerProfile
            {
                FullName = "Lecturer User",
                Email = "lecturer@gapsense.local",
                PhoneNumber = string.Empty,
                Department = "Faculty of Computing"
            };
            await _profiles.AddAsync(profile, ct);
        }

        var settings = await _settings.GetByLecturerIdAsync(profile.Id, ct);
        if (settings is null)
        {
            settings = new LecturerNotificationSettings
            {
                LecturerProfileId = profile.Id,
                EmailAlerts = true,
                StudentRiskAlerts = true,
                AssignmentReminders = true,
                WeeklyReports = true
            };
            await _settings.AddAsync(settings, ct);
        }

        return (profile, settings);
    }

    private static NotificationFeedItemResponse ToDto(NotificationFeedItem item) =>
        new(
            item.Id,
            item.Title,
            item.Message,
            item.Type,
            ToRelative(item.CreatedAt),
            item.ReadAtUtc is not null,
            item.Route
        );

    private static string ToRelative(DateTime timestampUtc)
    {
        var span = DateTime.UtcNow - timestampUtc;
        if (span.TotalMinutes < 1) return "just now";
        if (span.TotalHours < 1) return $"{Math.Max(1, (int)span.TotalMinutes)} min ago";
        if (span.TotalDays < 1) return $"{Math.Max(1, (int)span.TotalHours)} hour ago";
        if (span.TotalDays < 7) return $"{Math.Max(1, (int)span.TotalDays)} day ago";
        return timestampUtc.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
    }
}
