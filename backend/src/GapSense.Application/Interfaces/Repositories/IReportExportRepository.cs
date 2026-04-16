using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface IReportExportRepository
{
    Task AddAsync(ReportExport entity, CancellationToken ct);
    Task<ReportExport?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyList<ReportExport>> GetRecentAsync(int take, CancellationToken ct);
    Task<int> CountLastMonthAsync(CancellationToken ct);
    Task<(string ReportType, int Count)?> GetMostExportedAsync(CancellationToken ct);
}
