using GapSense.Application.DTOs;

namespace GapSense.Application.Services;

public interface IOptionalModulesService
{
    Task<IReadOnlyList<CourseModuleResponse>> GetCourseModulesAsync(CancellationToken cancellationToken = default);

    Task<CourseModuleResponse> CreateCourseModuleAsync(CreateCourseModuleRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LecturerAssignmentResponse>> GetLecturerAssignmentsAsync(Guid? lecturerUserId,
        CancellationToken cancellationToken = default);

    Task<LecturerAssignmentResponse> CreateLecturerAssignmentAsync(Guid actingLecturerUserId, bool isAdmin,
        CreateLecturerAssignmentRequest request, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<StudentInterventionResponse>> GetStudentInterventionsAsync(string role, Guid currentUserId,
        Guid? studentUserId, CancellationToken cancellationToken = default);

    Task<StudentInterventionResponse> CreateStudentInterventionAsync(CreateStudentInterventionRequest request,
        Guid createdByUserId, CancellationToken cancellationToken = default);

    Task<StudentInterventionResponse> PatchStudentInterventionAsync(Guid id, PatchStudentInterventionRequest request,
        Guid userId, string role, CancellationToken cancellationToken = default);

    Task DeleteStudentInterventionAsync(Guid id, Guid userId, string role, CancellationToken cancellationToken = default);
}
