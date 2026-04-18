using GapSense.Application.DTOs.Common;
using GapSense.Application.DTOs.Readiness;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GapSense.API.Controllers;

/// <summary>
/// Staff-only batch readiness summary derived from latest quiz submissions per student.
/// </summary>
[ApiController]
[Authorize(Roles = "admin,lecturer")]
[Route("api/readiness/batch-overview")]
public class ReadinessBatchOverviewController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ReadinessBatchOverviewController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<BatchReadinessOverviewResponse>>> Get(
        [FromQuery] string? moduleCode,
        [FromQuery] string? intake,
        CancellationToken cancellationToken)
    {
        var submissions = await _db.Submissions.AsNoTracking()
            .Include(s => s.Quiz)
            .ThenInclude(q => q.Module)
            .Where(s => s.Status == "Submitted" || s.Status == "Graded")
            .ToListAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(moduleCode))
        {
            var m = moduleCode.Trim();
            submissions = submissions
                .Where(s => string.Equals(s.Quiz.Module.ModuleCode, m, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        if (!string.IsNullOrWhiteSpace(intake))
        {
            var key = intake.Trim();
            submissions = submissions
                .Where(s => (s.Quiz.Intake ?? string.Empty).Contains(key, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        var latestByStudent = submissions
            .GroupBy(s => s.StudentId)
            .Select(g => g.OrderByDescending(x => x.SubmittedAt ?? x.CreatedAt).First())
            .ToList();

        const decimal highThreshold = 40m;
        const decimal mediumThreshold = 70m;

        var highRisk = latestByStudent.Count(s => s.Percentage < highThreshold);
        var avg = latestByStudent.Count == 0
            ? 0
            : (int)Math.Round(latestByStudent.Average(s => (double)s.Percentage));

        var rows = latestByStudent
            .OrderBy(s => s.Percentage)
            .ThenBy(s => s.StudentName)
            .Select(s => new BatchReadinessLedgerRowDto
            {
                Id = s.Id.ToString(),
                StudentId = s.StudentId,
                Name = s.StudentName,
                AvatarUrl = AvatarUrlFor(s),
                Module = $"{s.Quiz.Module.ModuleCode} — {s.Quiz.Module.ModuleName}",
                Score = (int)Math.Round(s.Percentage),
                Risk = s.Percentage < highThreshold ? "high" :
                    s.Percentage < mediumThreshold ? "medium" : "low",
                Status = s.Percentage < highThreshold ? "intervention" :
                    s.Percentage < mediumThreshold ? "monitoring" : "on_track",
            })
            .ToList();

        var response = new BatchReadinessOverviewResponse
        {
            TotalStudents = latestByStudent.Count,
            HighRiskCount = highRisk,
            BatchReadinessScore = avg,
            LedgerRows = rows,
        };

        return Ok(ApiResponseDto<BatchReadinessOverviewResponse>.SuccessResponse(response));
    }

    private static string AvatarUrlFor(Submission s)
    {
        if (!string.IsNullOrWhiteSpace(s.StudentAvatar) && s.StudentAvatar.StartsWith("http", StringComparison.OrdinalIgnoreCase))
        {
            return s.StudentAvatar;
        }

        var name = Uri.EscapeDataString(string.IsNullOrWhiteSpace(s.StudentName) ? "Student" : s.StudentName.Trim());
        return $"https://ui-avatars.com/api/?name={name}&background=003f87&color=fff&size=96";
    }
}
