using GapSense.Application.DTOs.Requests;
using GapSense.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/reports")]
public sealed class ReportsController : ControllerBase
{
    private readonly IReportsService _reports;

    public ReportsController(IReportsService reports)
    {
        _reports = reports;
    }

    [HttpGet("options")]
    public async Task<IActionResult> Options([FromQuery] Guid? semesterId, CancellationToken ct) =>
        Ok(await _reports.GetOptionsAsync(semesterId, ct));

    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromBody] GenerateReportRequest request, CancellationToken ct) =>
        Ok(await _reports.GenerateAsync(request, ct));

    [HttpGet("recent")]
    public async Task<IActionResult> Recent([FromQuery] int take = 10, CancellationToken ct = default) =>
        Ok(await _reports.GetRecentAsync(take, ct));

    [HttpGet("stats")]
    public async Task<IActionResult> Stats(CancellationToken ct) =>
        Ok(await _reports.GetStatsAsync(ct));

    [HttpGet("{id:guid}/download")]
    public async Task<IActionResult> Download(Guid id, CancellationToken ct)
    {
        var (content, fileName, contentType) = await _reports.DownloadAsync(id, ct);
        return File(content, contentType, fileName);
    }
}
