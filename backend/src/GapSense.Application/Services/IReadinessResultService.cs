namespace GapSense.Application.Services;

public interface IReadinessResultService
{
    /// <summary>Builds a PDF report for the readiness result, or null if not found.</summary>
    Task<byte[]?> GeneratePdfExportAsync(Guid id, CancellationToken cancellationToken = default);
}
