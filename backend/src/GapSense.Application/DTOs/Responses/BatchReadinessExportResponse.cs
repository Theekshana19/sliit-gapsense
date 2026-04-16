namespace GapSense.Application.DTOs.Responses;

public sealed record BatchReadinessExportResponse(
    string FilterDescription,
    BatchReadinessSummaryResponse Summary,
    IReadOnlyList<BatchReadinessLedgerRowResponse> LedgerRows);
