using GapSense.API.Models;
using GapSense.Application.DTOs;
using GapSense.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CourseModulesController : ControllerBase
{
    private readonly IOptionalModulesService _service;

    public CourseModulesController(IOptionalModulesService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<CourseModuleResponse>>>> GetAll(
        CancellationToken cancellationToken)
    {
        var items = await _service.GetCourseModulesAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<CourseModuleResponse>>.Ok(items));
    }

    [HttpPost]
    [Authorize(Roles = "admin,lecturer")]
    public async Task<ActionResult<ApiResponse<CourseModuleResponse>>> Create(
        [FromBody] CreateCourseModuleRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var item = await _service.CreateCourseModuleAsync(request, cancellationToken);
            return Ok(ApiResponse<CourseModuleResponse>.Ok(item, "Course module created."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<CourseModuleResponse?>.Fail(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<CourseModuleResponse?>.Fail(ex.Message));
        }
    }
}
