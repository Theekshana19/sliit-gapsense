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
public class StudentInterventionsController : ControllerBase
{
    private readonly IOptionalModulesService _service;

    public StudentInterventionsController(IOptionalModulesService service)
    {
        _service = service;
    }

    /// <summary>
    /// Students see only their interventions. Staff may pass ?studentUserId= to filter; omit to list all for admins/lecturers.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<StudentInterventionResponse>>>> Get(
        [FromQuery] Guid? studentUserId, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId) || !TryGetRole(out var role))
            return Unauthorized(ApiResponse<IReadOnlyList<StudentInterventionResponse>?>.Fail("Not authenticated."));

        Guid? filter = null;
        if (!string.Equals(role, "student", StringComparison.OrdinalIgnoreCase))
            filter = studentUserId;

        var items =
            await _service.GetStudentInterventionsAsync(role, userId, filter, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<StudentInterventionResponse>>.Ok(items));
    }

    [HttpPost]
    [Authorize(Roles = "admin,lecturer")]
    public async Task<ActionResult<ApiResponse<StudentInterventionResponse>>> Create(
        [FromBody] CreateStudentInterventionRequest request, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(ApiResponse<StudentInterventionResponse?>.Fail("Not authenticated."));

        try
        {
            var item = await _service.CreateStudentInterventionAsync(request, userId, cancellationToken);
            return Ok(ApiResponse<StudentInterventionResponse>.Ok(item, "Follow-up recorded."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<StudentInterventionResponse?>.Fail(ex.Message));
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
