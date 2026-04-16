namespace GapSense.Application.DTOs.Responses;

public sealed record ReportsOptionsResponse(
    IReadOnlyList<BatchReadinessSemesterOptionResponse> Semesters,
    IReadOnlyList<BatchReadinessModuleOptionResponse> Modules,
    IReadOnlyList<BatchReadinessIntakeOptionResponse> Intakes);

public sealed record ReportGenerateResponse(
    Guid ReportId,
    string FileName,
    string Status,
    DateTime GeneratedAtUtc);

public sealed record ReportHistoryItemResponse(
    Guid ReportId,
    string FileName,
    string FileMeta,
    string Batch,
    string GeneratedBy,
    string Status,
    bool IsPdf,
    DateTime GeneratedAtUtc);

public sealed record ReportStatsResponse(
    int LastMonthExports,
    string MostExported,
    int MostExportedCount);
