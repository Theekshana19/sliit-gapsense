using GapSense.Application.DTOs.Requests;
using GapSense.Application.Interfaces.Services;
using GapSense.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class NotificationsController : ControllerBase
{
    private readonly IInAppNotificationService _service;

    public NotificationsController(IInAppNotificationService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> ListForLecturer(
        [FromQuery] Guid lecturerProfileId,
        [FromQuery] NotificationKind? type,
        CancellationToken ct)
    {
        var items = await _service.ListForLecturerAsync(lecturerProfileId, type, ct);
        return Ok(items);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> UnreadCount([FromQuery] Guid lecturerProfileId, CancellationToken ct)
    {
        var count = await _service.GetUnreadCountAsync(lecturerProfileId, ct);
        return Ok(new { count });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var item = await _service.GetAsync(id, ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInAppNotificationRequest request, CancellationToken ct)
    {
        var created = await _service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateInAppNotificationRequest request, CancellationToken ct)
    {
        var updated = await _service.UpdateAsync(id, request, ct);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var ok = await _service.DeleteAsync(id, ct);
        return ok ? NoContent() : NotFound();
    }

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        var ok = await _service.MarkReadAsync(id, ct);
        return ok ? NoContent() : NotFound();
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllRead([FromQuery] Guid lecturerProfileId, CancellationToken ct)
    {
        await _service.MarkAllReadAsync(lecturerProfileId, ct);
        return NoContent();
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearAll([FromQuery] Guid lecturerProfileId, CancellationToken ct)
    {
        await _service.ClearAllAsync(lecturerProfileId, ct);
        return NoContent();
    }
}
