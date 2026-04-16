using GapSense.Application.DTOs.Requests;
using GapSense.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class InterventionAssignmentsController : ControllerBase
{
    private readonly IInterventionAssignmentService _service;

    public InterventionAssignmentsController(IInterventionAssignmentService service)
    {
        _service = service;
    }

    [HttpGet("student/{studentProfileId:guid}")]
    public async Task<IActionResult> ListByStudent(Guid studentProfileId, CancellationToken ct) =>
        Ok(await _service.ListByStudentAsync(studentProfileId, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var item = await _service.GetAsync(id, ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct) => Ok(await _service.ListAsync(ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInterventionAssignmentRequest request, CancellationToken ct)
    {
        var created = await _service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateInterventionAssignmentRequest request, CancellationToken ct)
    {
        var updated = await _service.UpdateAsync(id, request, ct);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct) =>
        await _service.DeleteAsync(id, ct) ? NoContent() : NotFound();
}
