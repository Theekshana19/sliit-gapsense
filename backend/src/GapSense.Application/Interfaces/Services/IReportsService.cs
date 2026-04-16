using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface IReportsService
{
    Task<ReportsOptionsResponse> GetOptionsAsync(Guid? semesterId, CancellationToken ct);
    Task<ReportGenerateResponse> GenerateAsync(GenerateReportRequest request, CancellationToken ct);
    Task<IReadOnlyList<ReportHistoryItemResponse>> GetRecentAsync(int take, CancellationToken ct);
    Task<ReportStatsResponse> GetStatsAsync(CancellationToken ct);
    Task<(byte[] Content, string FileName, string ContentType)> DownloadAsync(Guid reportId, CancellationToken ct);
}
