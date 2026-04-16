using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface ISemesterService
{
    Task<IReadOnlyList<SemesterResponse>> ListAsync(CancellationToken ct);
    Task<SemesterResponse?> GetCurrentAsync(CancellationToken ct);
}
