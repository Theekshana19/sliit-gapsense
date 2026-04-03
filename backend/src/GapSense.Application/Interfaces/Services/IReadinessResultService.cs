using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface IReadinessResultService
{
    Task<IReadOnlyList<ReadinessResultResponse>> ListAsync(CancellationToken ct);
    Task<ReadinessResultResponse?> GetAsync(Guid id, CancellationToken ct);
    Task<ReadinessResultResponse> CreateAsync(CreateReadinessResultRequest request, CancellationToken ct);
    Task<ReadinessResultResponse?> UpdateAsync(Guid id, UpdateReadinessResultRequest request, CancellationToken ct);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct);
}

