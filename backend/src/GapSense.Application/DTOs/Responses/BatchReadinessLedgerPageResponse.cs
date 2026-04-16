namespace GapSense.Application.DTOs.Responses;

public sealed record BatchReadinessLedgerPageResponse(
    IReadOnlyList<BatchReadinessLedgerRowResponse> Items,
    int TotalCount,
    int Page,
    int PageSize);
