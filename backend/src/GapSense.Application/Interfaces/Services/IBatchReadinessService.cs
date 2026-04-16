using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface IBatchReadinessService
{
    Task<BatchReadinessFilterOptionsResponse> GetFilterOptionsAsync(Guid? semesterId, CancellationToken ct);

    Task<BatchReadinessSummaryResponse> GetOverviewAsync(BatchReadinessFilterRequest request, CancellationToken ct);

    Task<BatchReadinessLedgerPageResponse> GetLedgerPageAsync(BatchReadinessLedgerRequest request, CancellationToken ct);

    Task<BatchReadinessExportResponse> GetExportDataAsync(BatchReadinessFilterRequest request, CancellationToken ct);
}
