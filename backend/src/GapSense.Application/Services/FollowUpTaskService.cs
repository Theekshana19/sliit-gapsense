using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Application.Mappings;
using GapSense.Domain.Entities;
using GapSense.Domain.Enums;

namespace GapSense.Application.Services;

public sealed class FollowUpTaskService : IFollowUpTaskService
{
    private readonly IFollowUpTaskRepository _repo;
    private readonly IStudentProfileRepository _students;
    private readonly ISemesterRepository _semesters;
    private readonly IMonitoringNoteRepository _notes;
    private readonly IInterventionAssignmentRepository _interventions;
    private readonly INotificationFeedService _notifications;

    public FollowUpTaskService(
        IFollowUpTaskRepository repo,
        IStudentProfileRepository students,
        ISemesterRepository semesters,
        IMonitoringNoteRepository notes,
        IInterventionAssignmentRepository interventions,
        INotificationFeedService notifications)
    {
        _repo = repo;
        _students = students;
        _semesters = semesters;
        _notes = notes;
        _interventions = interventions;
        _notifications = notifications;
    }

    public async Task<FollowUpQueueResponse> GetQueueAsync(Guid semesterId, CancellationToken ct)
    {
        await EnsureSemesterExists(semesterId, ct);
        var items = await _repo.ListQueueForSemesterAsync(semesterId, ct);
        var dtos = items.Select(x => x.ToResponse()).ToList();
        var message = BuildQueueMessage(dtos.Count);
        return new FollowUpQueueResponse(dtos.Count, message, dtos);
    }

    public async Task<IReadOnlyList<FollowUpTaskResponse>> ListByStudentAsync(Guid studentProfileId, CancellationToken ct)
    {
        await EnsureStudentExists(studentProfileId, ct);
        var list = await _repo.ListByStudentProfileIdAsync(studentProfileId, ct);
        return list.Select(x => x.ToResponse()).ToList();
    }

    public async Task<FollowUpManagementResponse> GetManagementAsync(
        Guid semesterId,
        string? search,
        string? module,
        string? status,
        CancellationToken ct)
    {
        await EnsureSemesterExists(semesterId, ct);
        var all = (await _repo.ListForSemesterAsync(semesterId, ct)).ToList();

        var modules = all
            .Select(x => x.StudentProfile?.CurrentModule)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(x => x)
            .ToList();

        var filtered = all.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var needle = search.Trim();
            filtered = filtered.Where(x =>
                (x.StudentProfile?.FullName?.Contains(needle, StringComparison.OrdinalIgnoreCase) ?? false) ||
                (x.StudentProfile?.StudentId?.Contains(needle, StringComparison.OrdinalIgnoreCase) ?? false));
        }

        if (!string.IsNullOrWhiteSpace(module))
        {
            var selected = module.Trim();
            filtered = filtered.Where(x =>
                string.Equals(x.StudentProfile?.CurrentModule, selected, StringComparison.OrdinalIgnoreCase));
        }

        if (string.Equals(status, "Overdue", StringComparison.OrdinalIgnoreCase))
        {
            filtered = filtered.Where(IsOverdue);
        }
        else if (TryParseStatus(status, out var parsed))
        {
            filtered = filtered.Where(x => x.Status == parsed);
        }

        var items = filtered.ToList();
        var overdue = items.Count(x => IsOverdue(x));
        var pending = items.Count(x => x.Status == FollowUpStatus.Pending || x.Status == FollowUpStatus.InProgress);

        var recentNotes = await BuildRecentNotesAsync(semesterId, ct);
        var trend = BuildTrend(all);
        var activePrograms = await BuildActiveProgramsAsync(semesterId, ct);

        return new FollowUpManagementResponse(
            items.Count,
            overdue,
            pending,
            modules,
            items.Select(x => x.ToResponse()).ToList(),
            recentNotes,
            trend,
            activePrograms);
    }

    public async Task<FollowUpTaskResponse> CreateAsync(CreateFollowUpTaskRequest request, CancellationToken ct)
    {
        await EnsureStudentExists(request.StudentProfileId, ct);
        var due = NormalizeUtc(request.DueDate);
        var entity = new FollowUpTask
        {
            StudentProfileId = request.StudentProfileId,
            Title = request.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            DueDate = due,
            Status = request.Status,
            Priority = request.Priority,
            AssignedTo = request.AssignedTo.Trim(),
            IsDismissed = false,
            IsActive = true,
        };
        await _repo.AddAsync(entity, ct);
        var created = await _repo.GetByIdAsync(entity.Id, ct) ?? entity;

        // If a follow-up is already overdue at creation time, publish immediately.
        if (created.IsActive && !created.IsDismissed && created.DueDate.Date < DateTime.UtcNow.Date && created.Status != FollowUpStatus.Completed)
        {
            await _notifications.PublishAsync(
                new PublishNotificationRequest(
                    "reminder",
                    $"followup-overdue-{created.Id}",
                    "Follow-up overdue",
                    $"{created.Title} is overdue since {created.DueDate:yyyy-MM-dd}.",
                    "/monitoring/follow-ups"),
                ct);
        }

        return created.ToResponse();
    }

    public async Task<FollowUpTaskResponse?> UpdateAsync(Guid id, UpdateFollowUpTaskRequest request, CancellationToken ct)
    {
        var entity = await _repo.GetTrackedByIdAsync(id, ct);
        if (entity is null)
        {
            return null;
        }

        entity.Title = request.Title.Trim();
        entity.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        var newDueDate = NormalizeUtc(request.DueDate);
        if (newDueDate.Date < entity.DueDate.Date)
        {
            throw new ArgumentException("Date must be after the current follow-up date.");
        }

        entity.DueDate = newDueDate;
        entity.Status = request.Status;
        entity.Priority = request.Priority;
        entity.AssignedTo = request.AssignedTo.Trim();
        entity.IsDismissed = request.IsDismissed;
        entity.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(entity, ct);
        var updated = await _repo.GetByIdAsync(id, ct) ?? entity;

        // If update results in an overdue follow-up, publish immediately.
        if (updated.IsActive && !updated.IsDismissed && updated.DueDate.Date < DateTime.UtcNow.Date && updated.Status != FollowUpStatus.Completed)
        {
            await _notifications.PublishAsync(
                new PublishNotificationRequest(
                    "reminder",
                    $"followup-overdue-{updated.Id}",
                    "Follow-up overdue",
                    $"{updated.Title} is overdue since {updated.DueDate:yyyy-MM-dd}.",
                    "/monitoring/follow-ups"),
                ct);
        }

        return updated.ToResponse();
    }

    public async Task<FollowUpTaskResponse?> MarkCompletedAsync(Guid id, CancellationToken ct)
    {
        var entity = await _repo.GetTrackedByIdAsync(id, ct);
        if (entity is null || !entity.IsActive)
        {
            return null;
        }

        entity.Status = FollowUpStatus.Completed;
        entity.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(entity, ct);
        var updated = await _repo.GetByIdAsync(id, ct) ?? entity;
        return updated.ToResponse();
    }

    public async Task<int> RemindAllAsync(Guid semesterId, CancellationToken ct)
    {
        await EnsureSemesterExists(semesterId, ct);
        return await _repo.RemindAllPendingForSemesterAsync(semesterId, ct);
    }

    public async Task<bool> DismissAsync(Guid id, CancellationToken ct)
    {
        var entity = await _repo.GetTrackedByIdAsync(id, ct);
        if (entity is null || !entity.IsActive)
        {
            return false;
        }

        entity.IsDismissed = true;
        entity.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(entity, ct);
        return true;
    }

    public async Task<int> DismissQueueAsync(Guid semesterId, CancellationToken ct)
    {
        await EnsureSemesterExists(semesterId, ct);
        return await _repo.DismissAllPendingForSemesterAsync(semesterId, ct);
    }

    private static string BuildQueueMessage(int count) =>
        count switch
        {
            0 => "No pending follow-up items for this semester.",
            1 => "1 pending follow-up — review high-risk milestones in the table and assign interventions from the monitoring workspace.",
            _ => $"{count} pending follow-ups — includes high-risk reviews, intervention due dates, overdue items, and counselor referrals.",
        };

    private static DateTime NormalizeUtc(DateTime dt) =>
        dt.Kind == DateTimeKind.Utc ? dt : DateTime.SpecifyKind(dt, DateTimeKind.Utc);

    private static bool TryParseStatus(string? status, out FollowUpStatus parsed)
    {
        parsed = default;
        if (string.IsNullOrWhiteSpace(status))
        {
            return false;
        }

        return Enum.TryParse<FollowUpStatus>(status, true, out parsed);
    }

    private static bool IsOverdue(FollowUpTask task)
    {
        if (task.Status is FollowUpStatus.Completed or FollowUpStatus.Cancelled)
        {
            return false;
        }

        return task.DueDate.Date < DateTime.UtcNow.Date;
    }

    private static FollowUpTrendResponse BuildTrend(IReadOnlyList<FollowUpTask> all)
    {
        var now = DateTime.UtcNow;
        var monthly = new List<int>(5);
        for (var i = 4; i >= 0; i--)
        {
            var month = now.AddMonths(-i);
            var monthTasks = all.Where(x => x.CreatedAt.Year == month.Year && x.CreatedAt.Month == month.Month).ToList();
            if (monthTasks.Count == 0)
            {
                monthly.Add(0);
                continue;
            }

            var completed = monthTasks.Count(x => x.Status == FollowUpStatus.Completed);
            monthly.Add((int)Math.Round(100m * completed / monthTasks.Count, MidpointRounding.AwayFromZero));
        }

        var total = all.Count;
        var completedTotal = all.Count(x => x.Status == FollowUpStatus.Completed);
        var completionRate = total == 0 ? 0 : Math.Round(100m * completedTotal / total, 1);
        var prevAverage = monthly.Take(4).DefaultIfEmpty(0).Average();
        var last = monthly.LastOrDefault();
        var change = Math.Round(last - (decimal)prevAverage, 1);
        return new FollowUpTrendResponse(completionRate, change, monthly);
    }

    private async Task<IReadOnlyList<FollowUpRecentNoteResponse>> BuildRecentNotesAsync(Guid semesterId, CancellationToken ct)
    {
        var students = await _students.ListActiveBySemesterIdAsync(semesterId, ct);
        var notes = new List<FollowUpRecentNoteResponse>();
        foreach (var s in students)
        {
            var studentNotes = await _notes.ListByStudentProfileIdAsync(s.Id, ct);
            notes.AddRange(studentNotes.Select(n =>
                new FollowUpRecentNoteResponse(n.Id, n.AddedBy, s.FullName, n.NoteText, n.CreatedAt)));
        }

        return notes.OrderByDescending(x => x.CreatedAt).Take(6).ToList();
    }

    private async Task<IReadOnlyList<FollowUpActiveProgramResponse>> BuildActiveProgramsAsync(Guid semesterId, CancellationToken ct)
    {
        var students = await _students.ListActiveBySemesterIdAsync(semesterId, ct);
        var groups = new Dictionary<string, HashSet<Guid>>(StringComparer.OrdinalIgnoreCase);
        foreach (var s in students)
        {
            var items = await _interventions.ListByStudentProfileIdAsync(s.Id, ct);
            foreach (var i in items.Where(x => x.IsActive))
            {
                var key = string.IsNullOrWhiteSpace(i.InterventionType) ? "Other" : i.InterventionType.Trim();
                if (!groups.TryGetValue(key, out var ids))
                {
                    ids = [];
                    groups[key] = ids;
                }

                ids.Add(s.Id);
            }
        }

        var totalStudents = Math.Max(1, students.Count);
        return groups
            .Select(x => new FollowUpActiveProgramResponse(
                ToProgramLabel(x.Key),
                x.Value.Count,
                Math.Round(100m * x.Value.Count / totalStudents, 1)))
            .OrderByDescending(x => x.StudentCount)
            .Take(4)
            .ToList();
    }

    private static string ToProgramLabel(string interventionType)
    {
        if (interventionType.Contains('-', StringComparison.Ordinal))
        {
            var parts = interventionType.Split('-', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            if (parts.Length > 0)
            {
                return string.Join(' ', parts.Select(CapitalizeWord));
            }
        }

        if (interventionType.Contains(' ', StringComparison.Ordinal))
        {
            return string.Join(' ', interventionType.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).Select(CapitalizeWord));
        }

        return CapitalizeWord(interventionType);
    }

    private static string CapitalizeWord(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return value;
        }

        return value.Length == 1
            ? value.ToUpperInvariant()
            : char.ToUpperInvariant(value[0]) + value[1..].ToLowerInvariant();
    }

    private async Task EnsureStudentExists(Guid studentProfileId, CancellationToken ct)
    {
        _ = await _students.GetActiveByIdAsync(studentProfileId, ct)
            ?? throw new KeyNotFoundException("Student profile was not found.");
    }

    private async Task EnsureSemesterExists(Guid semesterId, CancellationToken ct)
    {
        _ = await _semesters.GetByIdAsync(semesterId, ct)
            ?? throw new KeyNotFoundException("Semester was not found.");
    }
}
