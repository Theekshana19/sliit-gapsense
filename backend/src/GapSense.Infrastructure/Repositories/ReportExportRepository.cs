using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class ReportExportRepository : IReportExportRepository
{
    private readonly GapSenseDbContext _db;

    public ReportExportRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(ReportExport entity, CancellationToken ct)
    {
        _db.ReportExports.Add(entity);
        await _db.SaveChangesAsync(ct);
    }

    public Task<ReportExport?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _db.ReportExports.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && x.IsActive, ct);

    public async Task<IReadOnlyList<ReportExport>> GetRecentAsync(int take, CancellationToken ct) =>
        await _db.ReportExports.AsNoTracking()
            .Where(x => x.IsActive)
            .OrderByDescending(x => x.CreatedAt)
            .Take(Math.Clamp(take, 1, 100))
            .ToListAsync(ct);

    public async Task<int> CountLastMonthAsync(CancellationToken ct)
    {
        var from = DateTime.UtcNow.AddDays(-30);
        return await _db.ReportExports.AsNoTracking().CountAsync(x => x.IsActive && x.CreatedAt >= from, ct);
    }

    public async Task<(string ReportType, int Count)?> GetMostExportedAsync(CancellationToken ct)
    {
        var top = await _db.ReportExports.AsNoTracking()
            .Where(x => x.IsActive)
            .GroupBy(x => x.ReportType)
            .Select(g => new { ReportType = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .FirstOrDefaultAsync(ct);

        return top is null ? null : (top.ReportType, top.Count);
    }
}
