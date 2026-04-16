using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface IStudentProfileService
{
    Task<IReadOnlyList<StudentProfileListItemResponse>> ListAsync(CancellationToken ct);
    Task<StudentProfileListItemResponse?> GetAsync(Guid id, CancellationToken ct);
    Task<StudentMonitoringDetailsResponse?> GetDetailsAsync(Guid id, CancellationToken ct);
    Task<MonitoringSummaryResponse> GetMonitoringSummaryAsync(CancellationToken ct);
    Task<StudentProfileListItemResponse> CreateAsync(CreateStudentProfileRequest request, CancellationToken ct);
    Task<StudentProfileListItemResponse?> UpdateAsync(Guid id, UpdateStudentProfileRequest request, CancellationToken ct);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct);
}
