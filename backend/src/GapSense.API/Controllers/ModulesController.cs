using GapSense.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/modules")]
public sealed class ModulesController : ControllerBase
{
    private readonly IAcademicModuleService _modules;

    public ModulesController(IAcademicModuleService modules)
    {
        _modules = modules;
    }

    /// <summary>Lists academic modules; uses current semester when semesterId is omitted.</summary>
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] Guid? semesterId, CancellationToken ct) =>
        Ok(await _modules.ListAsync(semesterId, ct));
}
