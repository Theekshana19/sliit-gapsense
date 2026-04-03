using GapSense.API.Models;
using GapSense.Application.DTOs;
using GapSense.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin,lecturer")]
public class RiskThresholdsController : ControllerBase
{
    private readonly IRiskThresholdService _service;

    public RiskThresholdsController(IRiskThresholdService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<RiskThresholdResponse>>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await _service.GetAllAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<RiskThresholdResponse>>.Ok(items));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<RiskThresholdResponse>>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        if (item is null)
            return NotFound(ApiResponse<RiskThresholdResponse>.Fail("Risk threshold not found."));
        return Ok(ApiResponse<RiskThresholdResponse>.Ok(item));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<RiskThresholdResponse>>> Create([FromBody] CreateRiskThresholdRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var item = await _service.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, ApiResponse<RiskThresholdResponse>.Ok(item, "Risk threshold created successfully."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<RiskThresholdResponse?>.Fail(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<RiskThresholdResponse?>.Fail(ex.Message));
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<RiskThresholdResponse>>> Update(Guid id, [FromBody] UpdateRiskThresholdRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var item = await _service.UpdateAsync(id, request, cancellationToken);
            if (item is null)
                return NotFound(ApiResponse<RiskThresholdResponse>.Fail("Risk threshold not found."));
            return Ok(ApiResponse<RiskThresholdResponse>.Ok(item, "Risk threshold updated successfully."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<RiskThresholdResponse?>.Fail(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<RiskThresholdResponse?>.Fail(ex.Message));
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _service.DeleteAsync(id, cancellationToken);
        if (!deleted)
            return NotFound(ApiResponse<object>.Fail("Risk threshold not found."));
        return Ok(ApiResponse<object>.Ok(null, "Risk threshold deleted successfully."));
    }
}
