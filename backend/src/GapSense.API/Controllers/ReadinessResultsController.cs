using GapSense.API.Models;
using GapSense.Application.DTOs;
using GapSense.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/readiness-results")]
[Authorize]
public class ReadinessResultsController : ControllerBase
{
    private readonly IReadinessResultService _readinessResultService;

    public ReadinessResultsController(IReadinessResultService readinessResultService)
    {
        _readinessResultService = readinessResultService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ReadinessResultResponse>>>> GetAll(
        CancellationToken cancellationToken)
    {
        var items = await _readinessResultService.GetAllAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<ReadinessResultResponse>>.Ok(items));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ReadinessResultResponse>>> GetById(Guid id,
        CancellationToken cancellationToken)
    {
        var item = await _readinessResultService.GetByIdAsync(id, cancellationToken);
        if (item is null)
            return NotFound(ApiResponse<ReadinessResultResponse>.Fail("Readiness result not found."));
        return Ok(ApiResponse<ReadinessResultResponse>.Ok(item));
    }

    /// <summary>Downloads a PDF report for the readiness result.</summary>
    [HttpGet("{id:guid}/export-pdf")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ExportPdf(Guid id, CancellationToken cancellationToken)
    {
        var pdf = await _readinessResultService.GeneratePdfExportAsync(id, cancellationToken);
        if (pdf is null || pdf.Length == 0)
            return NotFound();

        var fileName = $"readiness-result-{id:N}.pdf";
        return File(pdf, "application/pdf", fileName);
    }
}
