using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GapSense.Infrastructure.Persistence;
using GapSense.Application.DTOs.Common;
using GapSense.Application.DTOs.Curriculum;

namespace GapSense.API.Controllers;

// handles all API requests related to validation alerts
// these are system-detected issues like circular dependencies, missing weights, etc.
// base route: /api/validation-alerts
[ApiController]
[Authorize]
[Route("api/validation-alerts")]
public class ValidationAlertsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ValidationAlertsController(ApplicationDbContext db)
    {
        _db = db;
    }

    // GET /api/validation-alerts - get all alerts
    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<List<ValidationAlertDto>>>> GetAlerts()
    {
        var alerts = await _db.ValidationAlerts
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new ValidationAlertDto
            {
                Id = a.Id,
                Type = a.Type,
                ModuleCode = a.ModuleCode,
                ModuleName = a.ModuleName,
                Severity = a.Severity,
                Description = a.Description,
                Status = a.Status,
                CreatedAt = a.CreatedAt.ToString("yyyy-MM-dd"),
            })
            .ToListAsync();

        return Ok(ApiResponseDto<List<ValidationAlertDto>>.SuccessResponse(alerts));
    }

    // GET /api/validation-alerts/stats - get alert statistics
    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponseDto<ValidationStatsDto>>> GetStats()
    {
        var alerts = await _db.ValidationAlerts.ToListAsync();

        // checks passed = number of resolved alerts + total modules with no issues
        // we count all modules and topics that don't have any unresolved alerts
        var resolvedAlerts = alerts.Count(a => a.Status == "Resolved");
        var totalModules = await _db.Modules.CountAsync();
        var totalTopics = await _db.Topics.CountAsync();
        // each module and topic counts as one "check" - if no alert exists for it, it passed
        var modulesWithIssues = alerts
            .Where(a => a.Status != "Resolved")
            .Select(a => a.ModuleCode)
            .Distinct()
            .Count();
        var passedChecks = resolvedAlerts + (totalModules - modulesWithIssues) + totalTopics;

        var stats = new ValidationStatsDto
        {
            CriticalCount = alerts.Count(a => a.Severity == "Critical" && a.Status != "Resolved"),
            ComplianceScore = alerts.Count > 0
                ? (int)(resolvedAlerts * 100.0 / alerts.Count)
                : 100,
            ChecksPassed = passedChecks,
        };

        return Ok(ApiResponseDto<ValidationStatsDto>.SuccessResponse(stats));
    }

    // PUT /api/validation-alerts/{id}/status - update alert status
    // only lecturers and admins can resolve/update alerts
    [HttpPut("{id}/status")]
    [Authorize(Roles = "admin,lecturer")]
    public async Task<ActionResult<ApiResponseDto<ValidationAlertDto>>> UpdateStatus(
        Guid id, UpdateAlertStatusDto dto)
    {
        var alert = await _db.ValidationAlerts.FindAsync(id);
        if (alert == null)
            return NotFound(ApiResponseDto<ValidationAlertDto>.ErrorResponse("Alert not found"));

        alert.Status = dto.Status;
        await _db.SaveChangesAsync();

        var result = new ValidationAlertDto
        {
            Id = alert.Id,
            Type = alert.Type,
            ModuleCode = alert.ModuleCode,
            ModuleName = alert.ModuleName,
            Severity = alert.Severity,
            Description = alert.Description,
            Status = alert.Status,
            CreatedAt = alert.CreatedAt.ToString("yyyy-MM-dd"),
        };

        return Ok(ApiResponseDto<ValidationAlertDto>.SuccessResponse(result, "Alert status updated"));
    }
}
