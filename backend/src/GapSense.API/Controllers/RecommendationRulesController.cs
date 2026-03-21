using GapSense.API.Models;
using GapSense.Application.DTOs;
using GapSense.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/recommendation-rules")]
public class RecommendationRulesController : ControllerBase
{
    private static readonly string[] AllowedAttachmentExtensions = [".pdf", ".doc", ".docx"];
    private const long MaxAttachmentBytes = 10 * 1024 * 1024;

    private readonly IRecommendationRuleService _service;
    private readonly IWebHostEnvironment _environment;

    public RecommendationRulesController(IRecommendationRuleService service, IWebHostEnvironment environment)
    {
        _service = service;
        _environment = environment;
    }

    [HttpPost("attachments")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxAttachmentBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxAttachmentBytes)]
    public async Task<ActionResult<ApiResponse<AttachmentUploadResult>>> UploadAttachment(
        IFormFile? file,
        CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
            return BadRequest(ApiResponse<AttachmentUploadResult?>.Fail("No file was uploaded."));

        if (file.Length > MaxAttachmentBytes)
            return BadRequest(ApiResponse<AttachmentUploadResult?>.Fail("File exceeds the maximum size of 10 MB."));

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(ext) || !AllowedAttachmentExtensions.Contains(ext))
            return BadRequest(ApiResponse<AttachmentUploadResult?>.Fail("Only PDF and Word documents (.pdf, .doc, .docx) are allowed."));

        var webRoot = _environment.WebRootPath;
        if (string.IsNullOrEmpty(webRoot))
            return StatusCode(500, ApiResponse<AttachmentUploadResult?>.Fail("Web root is not configured."));

        var uploadsDir = Path.Combine(webRoot, "uploads", "recommendation-rules");
        Directory.CreateDirectory(uploadsDir);

        var safeOriginal = Path.GetFileName(file.FileName);
        var storedFileName = $"{Guid.NewGuid():N}_{safeOriginal}";
        var physicalPath = Path.Combine(uploadsDir, storedFileName);

        await using (var stream = System.IO.File.Create(physicalPath))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        var webPath = "/uploads/recommendation-rules/" + storedFileName;
        return Ok(ApiResponse<AttachmentUploadResult>.Ok(new AttachmentUploadResult { AttachmentPath = webPath }));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<RecommendationRuleResponse>>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await _service.GetAllAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<RecommendationRuleResponse>>.Ok(items));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<RecommendationRuleResponse>>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        if (item is null)
            return NotFound(ApiResponse<RecommendationRuleResponse>.Fail("Recommendation rule not found."));
        return Ok(ApiResponse<RecommendationRuleResponse>.Ok(item));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<RecommendationRuleResponse>>> Create([FromBody] CreateRecommendationRuleRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var item = await _service.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, ApiResponse<RecommendationRuleResponse>.Ok(item, "Recommendation rule created successfully."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<RecommendationRuleResponse?>.Fail(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<RecommendationRuleResponse?>.Fail(ex.Message));
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<RecommendationRuleResponse>>> Update(Guid id, [FromBody] UpdateRecommendationRuleRequest request, CancellationToken cancellationToken)
    {
        RecommendationRuleResponse? before = null;
        try
        {
            before = await _service.GetByIdAsync(id, cancellationToken);
            var item = await _service.UpdateAsync(id, request, cancellationToken);
            if (item is null)
                return NotFound(ApiResponse<RecommendationRuleResponse>.Fail("Recommendation rule not found."));

            if (before is not null &&
                !string.Equals(NormalizePath(before.AttachmentPath), NormalizePath(item.AttachmentPath), StringComparison.Ordinal))
            {
                TryDeleteStoredAttachment(_environment, before.AttachmentPath);
            }

            return Ok(ApiResponse<RecommendationRuleResponse>.Ok(item, "Recommendation rule updated successfully."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<RecommendationRuleResponse?>.Fail(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<RecommendationRuleResponse?>.Fail(ex.Message));
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        var existing = await _service.GetByIdAsync(id, cancellationToken);
        var deleted = await _service.DeleteAsync(id, cancellationToken);
        if (!deleted)
            return NotFound(ApiResponse<object>.Fail("Recommendation rule not found."));

        if (existing?.AttachmentPath is not null)
            TryDeleteStoredAttachment(_environment, existing.AttachmentPath);

        return Ok(ApiResponse<object>.Ok(null, "Recommendation rule deleted successfully."));
    }

    private static string? NormalizePath(string? path) =>
        string.IsNullOrWhiteSpace(path) ? null : path.Trim();

    private static void TryDeleteStoredAttachment(IWebHostEnvironment env, string? webRelativePath)
    {
        if (string.IsNullOrWhiteSpace(webRelativePath) || string.IsNullOrEmpty(env.WebRootPath))
            return;

        var normalized = webRelativePath.Trim().Replace('\\', '/');
        if (!normalized.StartsWith("/uploads/recommendation-rules/", StringComparison.OrdinalIgnoreCase))
            return;

        var relative = normalized.TrimStart('/').Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (relative.Length < 3 || !string.Equals(relative[0], "uploads", StringComparison.OrdinalIgnoreCase) ||
            !string.Equals(relative[1], "recommendation-rules", StringComparison.OrdinalIgnoreCase))
            return;

        var uploadsRoot = Path.GetFullPath(Path.Combine(env.WebRootPath, "uploads", "recommendation-rules"));
        var fileName = relative[2];
        var fullPath = Path.GetFullPath(Path.Combine(uploadsRoot, fileName));
        if (!fullPath.StartsWith(uploadsRoot, StringComparison.OrdinalIgnoreCase))
            return;

        try
        {
            if (System.IO.File.Exists(fullPath))
                System.IO.File.Delete(fullPath);
        }
        catch
        {
            // best-effort cleanup
        }
    }
}
