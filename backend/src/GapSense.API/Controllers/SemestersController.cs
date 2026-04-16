using GapSense.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/semesters")]
public sealed class SemestersController : ControllerBase
{
    private readonly ISemesterService _semesters;

    public SemestersController(ISemesterService semesters)
    {
        _semesters = semesters;
    }

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct) => Ok(await _semesters.ListAsync(ct));

    [HttpGet("current")]
    public async Task<IActionResult> Current(CancellationToken ct)
    {
        var s = await _semesters.GetCurrentAsync(ct);
        return s is null ? NotFound(new { message = "No current semester is configured." }) : Ok(s);
    }
}
