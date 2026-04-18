using System.Security.Claims;
using GapSense.API.Models;
using GapSense.Application.DTOs;
using GapSense.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _service;

    public NotificationsController(INotificationService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<NotificationResponse>>>> Get(
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(ApiResponse<IReadOnlyList<NotificationResponse>?>.Fail("Not authenticated."));

        var items = await _service.GetForUserAsync(userId, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<NotificationResponse>>.Ok(items));
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<ActionResult<ApiResponse<object?>>> MarkRead(Guid id, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(ApiResponse<object?>.Fail("Not authenticated."));

        try
        {
            await _service.MarkReadAsync(userId, id, cancellationToken);
            return Ok(ApiResponse<object?>.Ok(null, "Marked as read."));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ApiResponse<object?>.Fail(ex.Message));
        }
    }

    [HttpPatch("mark-all-read")]
    public async Task<ActionResult<ApiResponse<object?>>> MarkAllRead(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(ApiResponse<object?>.Fail("Not authenticated."));

        await _service.MarkAllReadAsync(userId, cancellationToken);
        return Ok(ApiResponse<object?>.Ok(null, "All marked as read."));
    }

    [HttpDelete]
    public async Task<ActionResult<ApiResponse<object?>>> ClearAll(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(ApiResponse<object?>.Fail("Not authenticated."));

        await _service.DeleteAllForUserAsync(userId, cancellationToken);
        return Ok(ApiResponse<object?>.Ok(null, "Notifications cleared."));
    }

    private bool TryGetUserId(out Guid userId)
    {
        var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(idValue, out userId);
    }
}
