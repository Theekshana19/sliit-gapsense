using GapSense.Application.DTOs;

namespace GapSense.Application.Services;

public interface IReadinessResultService
{
    Task<IReadOnlyList<ReadinessResultResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<ReadinessResultResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Builds a PDF report for the readiness result, or null if not found.</summary>
    Task<byte[]?> GeneratePdfExportAsync(Guid id, CancellationToken cancellationToken = default);
}
