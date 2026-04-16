using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Domain.Entities;

namespace GapSense.Application.Services;

public sealed class BatchReadinessService : IBatchReadinessService
{
    private readonly ISemesterRepository _semesters;
    private readonly IAcademicModuleRepository _modules;
    private readonly IStudentProfileRepository _students;

    public BatchReadinessService(
        ISemesterRepository semesters,
        IAcademicModuleRepository modules,
        IStudentProfileRepository students)
    {
        _semesters = semesters;
        _modules = modules;
        _students = students;
    }

    public async Task<BatchReadinessFilterOptionsResponse> GetFilterOptionsAsync(Guid? semesterId, CancellationToken ct)
    {
        var semesters = await _semesters.ListActiveOrderedAsync(ct);
        var semesterList = semesters
            .Select(s => new BatchReadinessSemesterOptionResponse(s.Id, s.Name, s.AcademicYear, s.IsCurrent))
            .ToList();

        var targetSemesterId = semesterId ?? semesters.FirstOrDefault(s => s.IsCurrent)?.Id ?? semesters.FirstOrDefault()?.Id;
        if (targetSemesterId is null || targetSemesterId == Guid.Empty)
        {
            return new BatchReadinessFilterOptionsResponse(semesterList, [], []);
        }

        var modules = await _modules.ListBySemesterAsync(targetSemesterId.Value, ct);
        var moduleList = modules
            .Select(m => new BatchReadinessModuleOptionResponse(m.Id, m.ModuleCode, m.ModuleName))
            .ToList();

        var batches = await _students.GetDistinctBatchesForSemesterAsync(targetSemesterId.Value, ct);
        var intakeList = batches
            .Select(b => new BatchReadinessIntakeOptionResponse(b, $"Intake {b}"))
            .ToList();

        return new BatchReadinessFilterOptionsResponse(semesterList, moduleList, intakeList);
    }

    public async Task<BatchReadinessSummaryResponse> GetOverviewAsync(BatchReadinessFilterRequest request, CancellationToken ct)
    {
        await EnsureSemesterExistsAsync(request.SemesterId, ct);
        var moduleName = await ResolveModuleNameOrNullAsync(request.SemesterId, request.ModuleId, ct);
        var batch = NormalizeBatch(request.IntakeBatch);

        var (total, highRisk, avgReadiness, improvingShare, baselineAvg) =
            await _students.GetBatchReadinessAggregatesAsync(request.SemesterId, batch, moduleName, ct);

        var scorePct = total == 0 ? 0 : (int)Math.Round(avgReadiness, MidpointRounding.AwayFromZero);
        decimal? delta = null;
        if (baselineAvg.HasValue && total > 0)
        {
            delta = Math.Round((decimal)(avgReadiness - baselineAvg.Value), 1, MidpointRounding.AwayFromZero);
        }

        return new BatchReadinessSummaryResponse(
            total,
            highRisk,
            scorePct,
            delta,
            highRisk,
            improvingShare,
            DateTime.UtcNow);
    }

    public async Task<BatchReadinessLedgerPageResponse> GetLedgerPageAsync(BatchReadinessLedgerRequest request, CancellationToken ct)
    {
        await EnsureSemesterExistsAsync(request.SemesterId, ct);
        var moduleName = await ResolveModuleNameOrNullAsync(request.SemesterId, request.ModuleId, ct);
        var batch = NormalizeBatch(request.IntakeBatch);

        var (items, total) = await _students.GetBatchReadinessLedgerPageAsync(
            request.SemesterId,
            batch,
            moduleName,
            request.Page,
            request.PageSize,
            ct);

        var rows = items.Select(MapLedgerRow).ToList();
        return new BatchReadinessLedgerPageResponse(rows, total, request.Page, request.PageSize);
    }

    public async Task<BatchReadinessExportResponse> GetExportDataAsync(BatchReadinessFilterRequest request, CancellationToken ct)
    {
        var summary = await GetOverviewAsync(request, ct);
        await EnsureSemesterExistsAsync(request.SemesterId, ct);
        var moduleName = await ResolveModuleNameOrNullAsync(request.SemesterId, request.ModuleId, ct);
        var batch = NormalizeBatch(request.IntakeBatch);

        var (items, _) = await _students.GetBatchReadinessLedgerPageAsync(
            request.SemesterId,
            batch,
            moduleName,
            page: 1,
            pageSize: 5000,
            ct);

        var rows = items.Select(MapLedgerRow).ToList();
        var sem = await _semesters.GetByIdAsync(request.SemesterId, ct);
        var desc = BuildFilterDescription(request.SemesterId, batch, moduleName, sem);
        return new BatchReadinessExportResponse(desc, summary, rows);
    }

    private async Task EnsureSemesterExistsAsync(Guid semesterId, CancellationToken ct)
    {
        if (await _semesters.GetByIdAsync(semesterId, ct) is null)
        {
            throw new KeyNotFoundException("Semester was not found.");
        }
    }

    private async Task<string?> ResolveModuleNameOrNullAsync(Guid semesterId, Guid? moduleId, CancellationToken ct)
    {
        if (moduleId is null || moduleId == Guid.Empty)
        {
            return null;
        }

        var module = await _modules.GetByIdAsync(moduleId.Value, ct)
                     ?? throw new KeyNotFoundException("Module was not found.");

        if (module.SemesterId != semesterId)
        {
            throw new ArgumentException("The selected module does not belong to the selected semester.");
        }

        return module.ModuleName;
    }

    private static string? NormalizeBatch(string? intakeBatch)
    {
        if (string.IsNullOrWhiteSpace(intakeBatch))
        {
            return null;
        }

        return intakeBatch.Trim();
    }

    private static string BuildFilterDescription(Guid semesterId, string? batch, string? moduleName, Semester? semester)
    {
        var parts = new List<string>();
        if (semester is not null)
        {
            parts.Add($"{semester.Name} ({semester.AcademicYear})");
        }
        else
        {
            parts.Add($"Semester {semesterId}");
        }

        if (!string.IsNullOrEmpty(moduleName))
        {
            parts.Add($"Module: {moduleName}");
        }

        if (!string.IsNullOrEmpty(batch))
        {
            parts.Add($"Intake: {batch}");
        }

        return string.Join(" · ", parts);
    }

    private static BatchReadinessLedgerRowResponse MapLedgerRow(StudentProfile s)
    {
        var score = (int)Math.Round(s.ReadinessScore, MidpointRounding.AwayFromZero);
        return new BatchReadinessLedgerRowResponse(
            s.Id,
            s.StudentId,
            s.FullName,
            BuildAvatarUrl(s.StudentId),
            s.CurrentModule,
            score,
            MapRiskUi(s.RiskLevel),
            MapStatusUi(s.RiskLevel));
    }

    private static string BuildAvatarUrl(string studentId) =>
        $"https://ui-avatars.com/api/?background=e0f2fe&color=003f87&size=96&bold=true&name={Uri.EscapeDataString(studentId)}";

    private static string MapRiskUi(string riskLevel)
    {
        return riskLevel.Trim().ToLowerInvariant() switch
        {
            "critical" => "high",
            "moderate" => "medium",
            _ => "low",
        };
    }

    private static string MapStatusUi(string riskLevel)
    {
        return riskLevel.Trim().ToLowerInvariant() switch
        {
            "critical" => "intervention",
            "moderate" => "monitoring",
            _ => "on_track",
        };
    }
}
