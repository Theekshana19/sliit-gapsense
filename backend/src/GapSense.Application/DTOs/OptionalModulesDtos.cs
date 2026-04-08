namespace GapSense.Application.DTOs;

public record CourseModuleResponse(
    Guid Id,
    string Code,
    string Title,
    string? Description,
    int SortOrder);

public record CreateCourseModuleRequest(
    string Code,
    string Title,
    string? Description,
    int SortOrder);

public record LecturerAssignmentResponse(
    Guid Id,
    Guid LecturerUserId,
    Guid CourseModuleId,
    string ModuleCode,
    string ModuleTitle,
    DateTime AssignedAtUtc);

public record CreateLecturerAssignmentRequest(
    Guid CourseModuleId,
    Guid? LecturerUserId);

public record StudentInterventionResponse(
    Guid Id,
    Guid StudentUserId,
    Guid CreatedByUserId,
    string Title,
    string? Notes,
    string Status,
    DateTime CreatedAtUtc);

public record CreateStudentInterventionRequest(
    Guid StudentUserId,
    string Title,
    string? Notes,
    string Status);
