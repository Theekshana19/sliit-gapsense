using GapSense.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/dashboard")]
public sealed class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboard;

    public DashboardController(IDashboardService dashboard)
    {
        _dashboard = dashboard;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> Summary([FromQuery] Guid? semesterId, CancellationToken ct) =>
        Ok(await _dashboard.GetSummaryAsync(semesterId, ct));

    [HttpGet("readiness-trend")]
    public async Task<IActionResult> ReadinessTrend([FromQuery] Guid? semesterId, CancellationToken ct) =>
        Ok(await _dashboard.GetReadinessTrendAsync(semesterId, ct));

    [HttpGet("risk-distribution")]
    public async Task<IActionResult> RiskDistribution([FromQuery] Guid? semesterId, CancellationToken ct) =>
        Ok(await _dashboard.GetRiskDistributionAsync(semesterId, ct));

    [HttpGet("full")]
    public async Task<IActionResult> Full([FromQuery] Guid? semesterId, CancellationToken ct) =>
        Ok(await _dashboard.GetFullAsync(semesterId, ct));
}
