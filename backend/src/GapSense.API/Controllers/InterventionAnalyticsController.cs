using GapSense.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/interventionanalytics")]
public sealed class InterventionAnalyticsController : ControllerBase
{
    private readonly IInterventionPlanningService _planning;

    public InterventionAnalyticsController(IInterventionPlanningService planning)
    {
        _planning = planning;
    }

    [HttpGet("success-rate")]
    public async Task<IActionResult> SuccessRate(CancellationToken ct)
    {
        var d = await _planning.GetDashboardAsync(ct);
        return Ok(new { successRatePercent = d.SuccessRatePercent, summary = d.SuccessSummary });
    }

    [HttpGet("pending-actions")]
    public async Task<IActionResult> PendingActions(CancellationToken ct)
    {
        var d = await _planning.GetDashboardAsync(ct);
        return Ok(new { count = d.PendingActionsCount, lines = d.PendingActionLines });
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard(CancellationToken ct) => Ok(await _planning.GetDashboardAsync(ct));
}
