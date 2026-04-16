using GapSense.Application.DTOs.Requests;
using GapSense.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/interventionplans")]
public sealed class InterventionPlansController : ControllerBase
{
    private readonly IInterventionPlanningService _planning;

    public InterventionPlansController(IInterventionPlanningService planning)
    {
        _planning = planning;
    }

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct) => Ok(await _planning.ListActiveAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var row = await _planning.GetAsync(id, ct);
        return row is null ? NotFound() : Ok(row);
    }

    [HttpPost("search")]
    public async Task<IActionResult> Search([FromBody] InterventionPlansSearchRequest request, CancellationToken ct) =>
        Ok(await _planning.SearchAsync(request, ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInterventionPlanRequest request, CancellationToken ct)
    {
        var created = await _planning.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct) =>
        await _planning.SoftDeleteAsync(id, ct) ? NoContent() : NotFound();
}
