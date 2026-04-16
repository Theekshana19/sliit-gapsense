using GapSense.Application.DTOs.Requests;
using GapSense.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/followups")]
public sealed class FollowUpsController : ControllerBase
{
    private readonly IFollowUpTaskService _followUps;

    public FollowUpsController(IFollowUpTaskService followUps)
    {
        _followUps = followUps;
    }

    [HttpGet("queue")]
    public async Task<IActionResult> Queue([FromQuery] Guid semesterId, CancellationToken ct) =>
        Ok(await _followUps.GetQueueAsync(semesterId, ct));

    [HttpGet("management")]
    public async Task<IActionResult> Management(
        [FromQuery] Guid semesterId,
        [FromQuery] string? search,
        [FromQuery] string? module,
        [FromQuery] string? status,
        CancellationToken ct) =>
        Ok(await _followUps.GetManagementAsync(semesterId, search, module, status, ct));

    [HttpGet("student/{studentProfileId:guid}")]
    public async Task<IActionResult> ListByStudent(Guid studentProfileId, CancellationToken ct) =>
        Ok(await _followUps.ListByStudentAsync(studentProfileId, ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateFollowUpTaskRequest request, CancellationToken ct)
    {
        var created = await _followUps.CreateAsync(request, ct);
        return StatusCode(StatusCodes.Status201Created, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFollowUpTaskRequest request, CancellationToken ct)
    {
        var updated = await _followUps.UpdateAsync(id, request, ct);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id, CancellationToken ct)
    {
        var updated = await _followUps.MarkCompletedAsync(id, ct);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpPost("remind-all")]
    public async Task<IActionResult> RemindAll([FromQuery] Guid semesterId, CancellationToken ct)
    {
        var n = await _followUps.RemindAllAsync(semesterId, ct);
        return Ok(new { remindedCount = n });
    }

    [HttpPost("dismiss-queue")]
    public async Task<IActionResult> DismissQueue([FromQuery] Guid semesterId, CancellationToken ct)
    {
        var n = await _followUps.DismissQueueAsync(semesterId, ct);
        return Ok(new { dismissedCount = n });
    }

    [HttpPost("{id:guid}/dismiss")]
    public async Task<IActionResult> DismissOne(Guid id, CancellationToken ct) =>
        await _followUps.DismissAsync(id, ct) ? NoContent() : NotFound();
}
