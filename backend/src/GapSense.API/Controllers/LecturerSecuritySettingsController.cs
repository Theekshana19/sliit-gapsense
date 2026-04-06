using GapSense.Application.DTOs.Requests;
using GapSense.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class LecturerSecuritySettingsController : ControllerBase
{
    private readonly ILecturerSecuritySettingsService _service;

    public LecturerSecuritySettingsController(ILecturerSecuritySettingsService service)
    {
        _service = service;
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var item = await _service.GetAsync(id, ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpGet("by-lecturer/{lecturerProfileId:guid}")]
    public async Task<IActionResult> GetByLecturer(Guid lecturerProfileId, CancellationToken ct)
    {
        var item = await _service.GetByLecturerAsync(lecturerProfileId, ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLecturerSecuritySettingsRequest request, CancellationToken ct)
    {
        var updated = await _service.UpdateAsync(id, request, ct);
        return updated is null ? NotFound() : Ok(updated);
    }
}
