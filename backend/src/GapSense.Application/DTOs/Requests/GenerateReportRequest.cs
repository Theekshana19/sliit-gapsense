namespace GapSense.Application.DTOs.Requests;

public sealed record GenerateReportRequest(
    string ReportType,
    string Format,
    Guid SemesterId,
    string Batch,
    Guid? ModuleId
);
