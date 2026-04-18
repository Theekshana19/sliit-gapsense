using GapSense.Application.DTOs;
using GapSense.Application.Services;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Services;

public class OptionalModulesService : IOptionalModulesService
{
    private readonly ApplicationDbContext _db;
    private readonly INotificationService _notifications;

    public OptionalModulesService(ApplicationDbContext db, INotificationService notifications)
    {
        _db = db;
        _notifications = notifications;
    }

    public async Task<IReadOnlyList<CourseModuleResponse>> GetCourseModulesAsync(
        CancellationToken cancellationToken = default)
    {
        return await _db.CourseModules.AsNoTracking()
            .OrderBy(m => m.SortOrder)
            .ThenBy(m => m.Code)
            .Select(m => new CourseModuleResponse(m.Id, m.Code, m.Title, m.Description, m.SortOrder))
            .ToListAsync(cancellationToken);
    }

    public async Task<CourseModuleResponse> CreateCourseModuleAsync(CreateCourseModuleRequest request,
        CancellationToken cancellationToken = default)
    {
        var code = request.Code.Trim().ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("Code is required.");
        if (await _db.CourseModules.AnyAsync(m => m.Code == code, cancellationToken))
            throw new InvalidOperationException("Module code already exists.");

        var entity = new CourseModule
        {
            Id = Guid.NewGuid(),
            Code = code,
            Title = request.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            SortOrder = request.SortOrder,
            CreatedAtUtc = DateTime.UtcNow
        };
        _db.CourseModules.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return new CourseModuleResponse(entity.Id, entity.Code, entity.Title, entity.Description, entity.SortOrder);
    }

    public async Task<IReadOnlyList<LecturerAssignmentResponse>> GetLecturerAssignmentsAsync(Guid? lecturerUserId,
        CancellationToken cancellationToken = default)
    {
        var query = _db.LecturerModuleAssignments.AsNoTracking()
            .Include(a => a.CourseModule)
            .AsQueryable();
        if (lecturerUserId.HasValue)
            query = query.Where(a => a.LecturerUserId == lecturerUserId.Value);

        return await query
            .OrderBy(a => a.CourseModule.Code)
            .Select(a => new LecturerAssignmentResponse(
                a.Id,
                a.LecturerUserId,
                a.CourseModuleId,
                a.CourseModule.Code,
                a.CourseModule.Title,
                a.AssignedAtUtc))
            .ToListAsync(cancellationToken);
    }

    public async Task<LecturerAssignmentResponse> CreateLecturerAssignmentAsync(Guid actingLecturerUserId,
        bool isAdmin, CreateLecturerAssignmentRequest request, CancellationToken cancellationToken = default)
    {
        var lecturerId = request.LecturerUserId ?? actingLecturerUserId;
        if (!isAdmin && lecturerId != actingLecturerUserId)
            throw new InvalidOperationException("Lecturers may only assign modules to themselves.");

        var module = await _db.CourseModules.AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == request.CourseModuleId, cancellationToken);
        if (module is null)
            throw new InvalidOperationException("Course module not found.");

        if (await _db.LecturerModuleAssignments.AnyAsync(
                a => a.LecturerUserId == lecturerId && a.CourseModuleId == request.CourseModuleId,
                cancellationToken))
            throw new InvalidOperationException("This module is already assigned to the lecturer.");

        var entity = new LecturerModuleAssignment
        {
            Id = Guid.NewGuid(),
            LecturerUserId = lecturerId,
            CourseModuleId = request.CourseModuleId,
            AssignedAtUtc = DateTime.UtcNow
        };
        _db.LecturerModuleAssignments.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        return new LecturerAssignmentResponse(
            entity.Id,
            entity.LecturerUserId,
            entity.CourseModuleId,
            module.Code,
            module.Title,
            entity.AssignedAtUtc);
    }

    public async Task<IReadOnlyList<StudentInterventionResponse>> GetStudentInterventionsAsync(string role,
        Guid currentUserId, Guid? studentUserId, CancellationToken cancellationToken = default)
    {
        var query = _db.StudentInterventions.AsNoTracking().AsQueryable();
        if (string.Equals(role, "student", StringComparison.OrdinalIgnoreCase))
            query = query.Where(i => i.StudentUserId == currentUserId);
        else if (studentUserId.HasValue)
            query = query.Where(i => i.StudentUserId == studentUserId.Value);

        return await query
            .OrderByDescending(i => i.CreatedAtUtc)
            .Select(i => new StudentInterventionResponse(
                i.Id,
                i.StudentUserId,
                i.CreatedByUserId,
                i.Title,
                i.Notes,
                i.Status,
                i.CreatedAtUtc))
            .ToListAsync(cancellationToken);
    }

    public async Task<StudentInterventionResponse> CreateStudentInterventionAsync(
        CreateStudentInterventionRequest request, Guid createdByUserId,
        CancellationToken cancellationToken = default)
    {
        var title = request.Title.Trim();
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required.");

        var status = string.IsNullOrWhiteSpace(request.Status) ? "open" : request.Status.Trim().ToLowerInvariant();
        if (status is not ("open" or "closed"))
            throw new ArgumentException("Status must be open or closed.");

        var entity = new StudentIntervention
        {
            Id = Guid.NewGuid(),
            StudentUserId = request.StudentUserId,
            CreatedByUserId = createdByUserId,
            Title = title,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            Status = status,
            CreatedAtUtc = DateTime.UtcNow
        };
        _db.StudentInterventions.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        await TryNotifyInterventionCreatedAsync(entity.StudentUserId, entity.Title, cancellationToken);

        return new StudentInterventionResponse(
            entity.Id,
            entity.StudentUserId,
            entity.CreatedByUserId,
            entity.Title,
            entity.Notes,
            entity.Status,
            entity.CreatedAtUtc);
    }

    public async Task<StudentInterventionResponse> PatchStudentInterventionAsync(Guid id,
        PatchStudentInterventionRequest request, Guid userId, string role,
        CancellationToken cancellationToken = default)
    {
        if (request.Status is null && request.Notes is null)
            throw new ArgumentException("Provide at least one of: status, notes.");

        var entity = await _db.StudentInterventions.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        if (entity is null)
            throw new InvalidOperationException("Intervention not found.");

        if (string.Equals(role, "student", StringComparison.OrdinalIgnoreCase) &&
            entity.StudentUserId != userId)
            throw new InvalidOperationException("Not allowed.");

        if (request.Status is not null)
        {
            var s = request.Status.Trim().ToLowerInvariant();
            if (s is not ("open" or "closed"))
                throw new ArgumentException("Status must be open or closed.");
            entity.Status = s;
        }

        if (request.Notes is not null)
            entity.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();

        await _db.SaveChangesAsync(cancellationToken);

        await TryNotifyInterventionUpdatedAsync(entity.StudentUserId, entity.Status, cancellationToken);

        return new StudentInterventionResponse(
            entity.Id,
            entity.StudentUserId,
            entity.CreatedByUserId,
            entity.Title,
            entity.Notes,
            entity.Status,
            entity.CreatedAtUtc);
    }

    private async Task TryNotifyInterventionCreatedAsync(Guid studentUserId, string title,
        CancellationToken cancellationToken)
    {
        try
        {
            await _notifications.CreateAsync(
                studentUserId,
                "New intervention",
                $"An intervention was recorded: {title}.",
                "academic",
                cancellationToken);
        }
        catch
        {
            /* Do not fail intervention save if notification insert fails. */
        }
    }

    private async Task TryNotifyInterventionUpdatedAsync(Guid studentUserId, string status,
        CancellationToken cancellationToken)
    {
        try
        {
            await _notifications.CreateAsync(
                studentUserId,
                "Intervention updated",
                $"Your intervention status is now {status}.",
                "system",
                cancellationToken);
        }
        catch
        {
            /* Do not fail patch if notification insert fails. */
        }
    }
}
