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
