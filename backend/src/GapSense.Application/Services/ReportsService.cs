using System.Text;
using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Domain.Entities;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace GapSense.Application.Services;

public sealed class ReportsService : IReportsService
{
    private static readonly string[] ReadinessHeaders =
    [
        "Student ID", "Name", "Module", "Readiness %", "Risk", "Status"
    ];

    private readonly ISemesterRepository _semesters;
    private readonly IAcademicModuleRepository _modules;
    private readonly IStudentProfileRepository _students;
    private readonly IReportExportRepository _exports;
    private readonly IBatchReadinessService _batchReadiness;
    private readonly INotificationFeedService _notifications;

    public ReportsService(
        ISemesterRepository semesters,
        IAcademicModuleRepository modules,
        IStudentProfileRepository students,
        IReportExportRepository exports,
        IBatchReadinessService batchReadiness,
        INotificationFeedService notifications)
    {
        _semesters = semesters;
        _modules = modules;
        _students = students;
        _exports = exports;
        _batchReadiness = batchReadiness;
        _notifications = notifications;
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<ReportsOptionsResponse> GetOptionsAsync(Guid? semesterId, CancellationToken ct)
    {
        var semesters = (await _semesters.ListActiveOrderedAsync(ct)).ToList();
        if (semesters.Count == 0)
        {
            // Fallback for environments with seeded rows missing IsActive flags.
            semesters = (await _semesters.ListOrderedAsync(ct)).ToList();
        }

        var semesterList = semesters
            .Select(s => new BatchReadinessSemesterOptionResponse(s.Id, s.Name, s.AcademicYear, s.IsCurrent))
            .ToList();

        var targetSemesterId = semesterId != null && semesterId != Guid.Empty
            ? semesterId
            : semesters.FirstOrDefault(s => s.IsCurrent)?.Id ?? semesters.FirstOrDefault()?.Id;
        if (targetSemesterId is null || targetSemesterId == Guid.Empty)
        {
            return new ReportsOptionsResponse(semesterList, [], []);
        }

        var modules = await _modules.ListBySemesterAsync(targetSemesterId.Value, ct);
        var moduleList = modules
            .Select(m => new BatchReadinessModuleOptionResponse(m.Id, m.ModuleCode, m.ModuleName))
            .ToList();

        var batches = await _students.GetDistinctBatchesForSemesterAsync(targetSemesterId.Value, ct);
        var intakeList = batches
            .Select(b => new BatchReadinessIntakeOptionResponse(b, $"Intake {b}"))
            .ToList();

        return new ReportsOptionsResponse(semesterList, moduleList, intakeList);
    }

    public async Task<ReportGenerateResponse> GenerateAsync(GenerateReportRequest request, CancellationToken ct)
    {
        var semester = await _semesters.GetByIdAsync(request.SemesterId, ct)
            ?? throw new KeyNotFoundException("Semester was not found.");

        var moduleName = await ResolveModuleNameOrNullAsync(request.SemesterId, request.ModuleId, ct);
        var reportTitle = ReportTitle(request.ReportType);
        var generatedAt = DateTime.UtcNow;
        var fileStem = $"{Sanitize(reportTitle)}_{semester.Name.Replace(' ', '-')}_{generatedAt:yyyyMMdd_HHmmss}";
        var (headers, rows) = await BuildRowsFromRealDataAsync(request, moduleName, ct);
        var content = request.Format == "pdf"
            ? BuildPdf(reportTitle, semester.Name, request.Batch, moduleName, headers, rows)
            : BuildCsv(headers, rows);
        var contentType = request.Format == "pdf" ? "application/pdf" : "text/csv";
        var extension = request.Format == "pdf" ? "pdf" : "csv";
        var fileName = $"{fileStem}.{extension}";

        var entity = new ReportExport
        {
            ReportType = request.ReportType,
            Format = request.Format,
            FileName = fileName,
            ContentType = contentType,
            FileContent = content,
            FileSizeBytes = content.LongLength,
            Status = "COMPLETED",
            Batch = request.Batch,
            ModuleCode = moduleName,
            SemesterId = semester.Id,
            SemesterName = semester.Name,
            GeneratedBy = "System",
            IsActive = true,
            CreatedAt = generatedAt,
        };
        await _exports.AddAsync(entity, ct);

        await _notifications.PublishAsync(
            new PublishNotificationRequest(
                "system",
                $"report-generated-{entity.Id}",
                "Report generated",
                $"{ReportTitle(request.ReportType)} generated successfully.",
                "/risk-analysis/reports"),
            ct);

        return new ReportGenerateResponse(entity.Id, entity.FileName, entity.Status, entity.CreatedAt);
    }

    public async Task<IReadOnlyList<ReportHistoryItemResponse>> GetRecentAsync(int take, CancellationToken ct)
    {
        var rows = await _exports.GetRecentAsync(take, ct);
        return rows.Select(x => new ReportHistoryItemResponse(
            x.Id,
            x.FileName,
            BuildFileMeta(x),
            x.Batch,
            x.GeneratedBy,
            x.Status,
            string.Equals(x.Format, "pdf", StringComparison.OrdinalIgnoreCase),
            x.CreatedAt)).ToList();
    }

    public async Task<ReportStatsResponse> GetStatsAsync(CancellationToken ct)
    {
        var lastMonth = await _exports.CountLastMonthAsync(ct);
        var top = await _exports.GetMostExportedAsync(ct);
        var most = top?.ReportType is null ? "N/A" : ReportTitle(top.Value.ReportType);
        return new ReportStatsResponse(lastMonth, most, top?.Count ?? 0);
    }

    public async Task<(byte[] Content, string FileName, string ContentType)> DownloadAsync(Guid reportId, CancellationToken ct)
    {
        var report = await _exports.GetByIdAsync(reportId, ct)
            ?? throw new KeyNotFoundException("Report was not found.");

        await _notifications.PublishAsync(
            new PublishNotificationRequest(
                "system",
                $"report-downloaded-{report.Id}",
                "Report downloaded",
                $"{ReportTitle(report.ReportType)} downloaded just now.",
                "/risk-analysis/reports"),
            ct);

        return (report.FileContent, report.FileName, report.ContentType);
    }

    private async Task<(IReadOnlyList<string> Headers, IReadOnlyList<string[]> Rows)> BuildRowsFromRealDataAsync(
        GenerateReportRequest request,
        string? moduleName,
        CancellationToken ct)
    {
        if (request.ReportType == "readiness")
        {
            var export = await _batchReadiness.GetExportDataAsync(new BatchReadinessFilterRequest
            {
                SemesterId = request.SemesterId,
                ModuleId = request.ModuleId,
                IntakeBatch = request.Batch,
            }, ct);

            var rows = export.LedgerRows.Select(r => new[]
            {
                r.StudentId,
                r.FullName,
                r.Module,
                r.ScorePercent.ToString(),
                r.RiskUi,
                r.StatusUi
            }).ToList();

            return (ReadinessHeaders, rows);
        }

        var students = (await _students.ListActiveBySemesterIdAsync(request.SemesterId, ct)).ToList();
        if (!string.IsNullOrWhiteSpace(request.Batch))
        {
            students = students.Where(s => string.Equals(s.Batch, request.Batch, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        if (!string.IsNullOrWhiteSpace(moduleName))
        {
            students = students.Where(s => string.Equals(s.CurrentModule, moduleName, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        return (BuildHeaders(request.ReportType), BuildRows(request.ReportType, students));
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

        // StudentProfile.CurrentModule values map to module name in this codebase.
        return module.ModuleName;
    }

    private static IReadOnlyList<string> BuildHeaders(string reportType) =>
        reportType switch
        {
            "readiness" => ReadinessHeaders,
            "module_risk" => ["Module", "Total Students", "High Risk", "Avg Readiness %", "Avg Risk Score"],
            "weak_topic" => ["Student ID", "Name", "Module", "Weak Topic", "Severity", "Identified At"],
            _ => throw new ArgumentException("Invalid report type."),
        };

    private static IReadOnlyList<string[]> BuildRows(string reportType, IReadOnlyList<StudentProfile> students) =>
        reportType switch
        {
            "readiness" => students.Select(s => new[]
            {
                s.StudentId,
                s.FullName,
                s.Batch,
                s.CurrentModule,
                $"{Math.Round(s.ReadinessScore, 1)}",
                s.RiskLevel,
                $"{Math.Round(s.AttendancePercentage, 1)}",
                $"{Math.Round(s.Gpa, 2)}",
            }).ToList(),
            "module_risk" => students
                .GroupBy(s => s.CurrentModule)
                .OrderBy(g => g.Key)
                .Select(g => new[]
                {
                    g.Key,
                    g.Count().ToString(),
                    g.Count(x => string.Equals(x.RiskLevel, "critical", StringComparison.OrdinalIgnoreCase)).ToString(),
                    Math.Round(g.Average(x => x.ReadinessScore), 1).ToString(),
                    Math.Round(g.Average(x => x.RiskScore), 1).ToString(),
                })
                .ToList(),
            "weak_topic" => students
                .SelectMany(s => (s.WeakTopics ?? []).Where(w => w.IsActive).Select(w => new[] {
                    s.StudentId,
                    s.FullName,
                    s.CurrentModule,
                    w.TopicName,
                    w.Severity,
                    w.CreatedAt.ToString("yyyy-MM-dd")
                }))
                .ToList(),
            _ => throw new ArgumentException("Invalid report type."),
        };

    private static byte[] BuildCsv(IReadOnlyList<string> headers, IReadOnlyList<string[]> rows)
    {
        static string Esc(string value)
        {
            if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
            {
                return $"\"{value.Replace("\"", "\"\"")}\"";
            }

            return value;
        }

        var sb = new StringBuilder();
        sb.AppendLine(string.Join(",", headers.Select(Esc)));
        foreach (var row in rows)
        {
            sb.AppendLine(string.Join(",", row.Select(Esc)));
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private static byte[] BuildPdf(
        string reportTitle,
        string semesterName,
        string batch,
        string? moduleName,
        IReadOnlyList<string> headers,
        IReadOnlyList<string[]> rows)
    {
        var doc = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(24);
                page.Size(PageSizes.A4);
                page.DefaultTextStyle(x => x.FontSize(10));
                page.Header().Column(c =>
                {
                    c.Item().Text(reportTitle).Bold().FontSize(18).FontColor(Colors.Blue.Darken3);
                    c.Item().Text($"Semester: {semesterName}");
                    c.Item().Text($"Batch: {batch}");
                    if (!string.IsNullOrWhiteSpace(moduleName))
                    {
                        c.Item().Text($"Module: {moduleName}");
                    }

                    c.Item().Text($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC");
                });

                page.Content().PaddingTop(12).Table(t =>
                {
                    t.ColumnsDefinition(cols =>
                    {
                        for (var i = 0; i < headers.Count; i++)
                        {
                            cols.RelativeColumn();
                        }
                    });

                    foreach (var h in headers)
                    {
                        t.Cell().Background(Colors.Blue.Lighten4).Border(1).BorderColor(Colors.Grey.Lighten2).Padding(4).Text(h).Bold();
                    }

                    foreach (var row in rows)
                    {
                        foreach (var cell in row)
                        {
                            t.Cell().Border(1).BorderColor(Colors.Grey.Lighten3).Padding(4).Text(cell);
                        }
                    }
                });
            });
        });

        return doc.GeneratePdf();
    }

    private static string ReportTitle(string reportType) =>
        reportType switch
        {
            "readiness" => "Student Readiness Report",
            "module_risk" => "Module Risk Report",
            "weak_topic" => "Weak Topic Report",
            _ => "Academic Report",
        };

    private static string BuildFileMeta(ReportExport export) =>
        $"{export.CreatedAt:MMM dd, yyyy} • {HumanFileSize(export.FileSizeBytes)}";

    private static string HumanFileSize(long bytes)
    {
        if (bytes < 1024)
        {
            return $"{bytes} B";
        }

        var kb = bytes / 1024d;
        if (kb < 1024)
        {
            return $"{Math.Round(kb, 1)} KB";
        }

        var mb = kb / 1024d;
        return $"{Math.Round(mb, 1)} MB";
    }

    private static string Sanitize(string input)
    {
        foreach (var c in Path.GetInvalidFileNameChars())
        {
            input = input.Replace(c, '-');
        }

        return input.Replace(' ', '-');
    }
}
