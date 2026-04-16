using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface IMonitoringNoteService
{
    Task<IReadOnlyList<MonitoringNoteResponse>> ListByStudentAsync(Guid studentProfileId, CancellationToken ct);
    Task<MonitoringNoteResponse> CreateAsync(CreateMonitoringNoteRequest request, CancellationToken ct);
}
