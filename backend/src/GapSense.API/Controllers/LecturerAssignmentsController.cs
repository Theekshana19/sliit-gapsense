using System.Security.Claims;
using GapSense.API.Models;
using GapSense.Application.DTOs;
using GapSense.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin,lecturer")]
public class LecturerAssignmentsController : ControllerBase
{
    private readonly IOptionalModulesService _service;

    public LecturerAssignmentsController(IOptionalModulesService service)
    {
        _service = service;
    }

    /// <summary>Admin: all assignments, or filter with ?lecturerUserId=. Lecturer: only their rows.</summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<LecturerAssignmentResponse>>>> Get(
        [FromQuery] Guid? lecturerUserId, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId) || !TryGetRole(out var role))
            return Unauthorized(ApiResponse<IReadOnlyList<LecturerAssignmentResponse>?>.Fail("Not authenticated."));

        var filter = string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase)
            ? lecturerUserId
            : userId;
        var items = await _service.GetLecturerAssignmentsAsync(filter, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<LecturerAssignmentResponse>>.Ok(items));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<LecturerAssignmentResponse>>> Create(
        [FromBody] CreateLecturerAssignmentRequest request, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId) || !TryGetRole(out var role))
            return Unauthorized(ApiResponse<LecturerAssignmentResponse?>.Fail("Not authenticated."));

        var isAdmin = string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase);
        try
        {
            var item = await _service.CreateLecturerAssignmentAsync(userId, isAdmin, request, cancellationToken);
            return Ok(ApiResponse<LecturerAssignmentResponse>.Ok(item, "Assignment created."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<LecturerAssignmentResponse?>.Fail(ex.Message));
        }
    }

    private bool TryGetUserId(out Guid userId)
    {
        var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(idValue, out userId);
    }

    private bool TryGetRole(out string role)
    {
        role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        return !string.IsNullOrEmpty(role);
    }
}
