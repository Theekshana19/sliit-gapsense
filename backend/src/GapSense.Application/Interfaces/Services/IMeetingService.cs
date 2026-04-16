using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface IMeetingService
{
    Task<IReadOnlyList<MeetingResponse>> ListByStudentAsync(Guid studentProfileId, CancellationToken ct);
    Task<MeetingResponse?> GetAsync(Guid id, CancellationToken ct);
    Task<MeetingResponse> CreateAsync(CreateMeetingRequest request, CancellationToken ct);
    Task<MeetingResponse?> UpdateAsync(Guid id, UpdateMeetingRequest request, CancellationToken ct);
}
