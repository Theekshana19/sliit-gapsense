namespace GapSense.Application.DTOs.Requests;

public sealed class BatchReadinessLedgerRequest : BatchReadinessFilterRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
