using GapSense.Application.DTOs.Requests;
using GapSense.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/batch-readiness")]
public sealed class BatchReadinessController : ControllerBase
{
    private readonly IBatchReadinessService _batchReadiness;

    public BatchReadinessController(IBatchReadinessService batchReadiness)
    {
        _batchReadiness = batchReadiness;
    }

    [HttpGet("filter-options")]
    public async Task<IActionResult> FilterOptions([FromQuery] Guid? semesterId, CancellationToken ct) =>
        Ok(await _batchReadiness.GetFilterOptionsAsync(semesterId, ct));

    [HttpPost("overview")]
    public async Task<IActionResult> Overview([FromBody] BatchReadinessFilterRequest request, CancellationToken ct) =>
        Ok(await _batchReadiness.GetOverviewAsync(request, ct));

    [HttpPost("ledger")]
    public async Task<IActionResult> Ledger([FromBody] BatchReadinessLedgerRequest request, CancellationToken ct) =>
        Ok(await _batchReadiness.GetLedgerPageAsync(request, ct));

    [HttpPost("export-data")]
    public async Task<IActionResult> ExportData([FromBody] BatchReadinessFilterRequest request, CancellationToken ct) =>
        Ok(await _batchReadiness.GetExportDataAsync(request, ct));
}
