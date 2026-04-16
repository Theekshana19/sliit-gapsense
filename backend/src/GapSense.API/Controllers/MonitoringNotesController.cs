using GapSense.Application.DTOs.Requests;
using GapSense.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class MonitoringNotesController : ControllerBase
{
    private readonly IMonitoringNoteService _service;

    public MonitoringNotesController(IMonitoringNoteService service)
    {
        _service = service;
    }

    [HttpGet("student/{studentProfileId:guid}")]
    public async Task<IActionResult> ListByStudent(Guid studentProfileId, CancellationToken ct) =>
        Ok(await _service.ListByStudentAsync(studentProfileId, ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMonitoringNoteRequest request, CancellationToken ct)
    {
        var created = await _service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(ListByStudent), new { studentProfileId = request.StudentProfileId }, created);
    }
}
