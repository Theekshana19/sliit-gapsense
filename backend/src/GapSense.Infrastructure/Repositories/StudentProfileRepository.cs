using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class StudentProfileRepository : IStudentProfileRepository
{
    private readonly GapSenseDbContext _db;

    public StudentProfileRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<StudentProfile>> ListActiveBySemesterIdAsync(Guid semesterId, CancellationToken ct) =>
        await _db.StudentProfiles
            .AsNoTracking()
            .Where(x => x.IsActive && x.SemesterId == semesterId)
            .Include(x => x.WeakTopics)
            .OrderByDescending(x => x.RiskScore)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<StudentProfile>> ListActiveForMonitoringAsync(CancellationToken ct) =>
        await _db.StudentProfiles
            .AsNoTracking()
            .Where(x => x.IsActive)
            .Include(x => x.WeakTopics)
            .OrderByDescending(x => x.RiskScore)
            .ToListAsync(ct);

    public Task<StudentProfile?> GetActiveByIdAsync(Guid id, CancellationToken ct) =>
        _db.StudentProfiles
            .AsNoTracking()
            .Include(x => x.WeakTopics)
            .FirstOrDefaultAsync(x => x.IsActive && x.Id == id, ct);

    public Task<StudentProfile?> GetTrackedActiveByIdAsync(Guid id, CancellationToken ct) =>
        _db.StudentProfiles.FirstOrDefaultAsync(x => x.Id == id && x.IsActive, ct);

    public Task<StudentProfile?> GetActiveWithDetailsAsync(Guid id, CancellationToken ct) =>
        _db.StudentProfiles
            .AsSplitQuery()
            .AsNoTracking()
            .Where(x => x.IsActive && x.Id == id)
            .Include(x => x.EnrolledSemester)
            .Include(x => x.WeakTopics)
            .Include(x => x.InterventionAssignments)
            .Include(x => x.MonitoringNotes)
            .Include(x => x.Meetings)
            .Include(x => x.Referrals)
            .FirstOrDefaultAsync(ct);

    public Task<bool> StudentIdExistsAsync(string studentId, Guid? excludeId, CancellationToken ct)
    {
        var q = _db.StudentProfiles.AsNoTracking().Where(x => x.StudentId == studentId);
        if (excludeId.HasValue)
        {
            q = q.Where(x => x.Id != excludeId.Value);
        }
        return q.AnyAsync(ct);
    }

    public async Task AddAsync(StudentProfile entity, CancellationToken ct)
    {
        _db.StudentProfiles.Add(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(StudentProfile entity, CancellationToken ct)
    {
        _db.StudentProfiles.Update(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<string>> GetDistinctBatchesForSemesterAsync(Guid semesterId, CancellationToken ct) =>
        await _db.StudentProfiles.AsNoTracking()
            .Where(x => x.IsActive && x.SemesterId == semesterId)
            .Select(x => x.Batch)
            .Distinct()
            .OrderBy(b => b)
            .ToListAsync(ct);

    public Task<bool> BatchExistsAsync(string batch, CancellationToken ct) =>
        _db.StudentProfiles.AsNoTracking()
            .AnyAsync(x => x.IsActive && x.Batch == batch, ct);

    public async Task<(int Total, int HighRisk, double AvgReadiness, decimal? ImprovingSharePercent, double? BaselineAvgReadiness)>
        GetBatchReadinessAggregatesAsync(
            Guid semesterId,
            string? batchExact,
            string? moduleNameExact,
            CancellationToken ct)
    {
        IQueryable<StudentProfile> Filtered()
        {
            var q = _db.StudentProfiles.AsNoTracking()
                .Where(x => x.IsActive && x.SemesterId == semesterId);
            if (!string.IsNullOrEmpty(batchExact))
            {
                q = q.Where(x => x.Batch == batchExact);
            }

            if (!string.IsNullOrEmpty(moduleNameExact))
            {
                q = q.Where(x => x.CurrentModule == moduleNameExact);
            }

            return q;
        }

        var filtered = Filtered();
        var total = await filtered.CountAsync(ct);
        var highRisk = await filtered.CountAsync(x => x.RiskLevel == "critical", ct);
        var avg = total == 0 ? 0d : await filtered.AverageAsync(x => (double)x.ReadinessScore, ct);
        var improving = total == 0 ? 0 : await filtered.CountAsync(x => x.PerformanceTrend == "improving", ct);
        var improvingShare = total == 0 ? null : (decimal?)Math.Round(100m * improving / total, 1, MidpointRounding.AwayFromZero);

        var baselineQ = _db.StudentProfiles.AsNoTracking()
            .Where(x => x.IsActive && x.SemesterId == semesterId);
        var baselineCount = await baselineQ.CountAsync(ct);
        var baselineAvg = baselineCount == 0 ? null : (double?)await baselineQ.AverageAsync(x => (double)x.ReadinessScore, ct);

        return (total, highRisk, avg, improvingShare, baselineAvg);
    }

    public async Task<(IReadOnlyList<StudentProfile> Items, int TotalCount)> GetBatchReadinessLedgerPageAsync(
        Guid semesterId,
        string? batchExact,
        string? moduleNameExact,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        var q = _db.StudentProfiles.AsNoTracking()
            .Where(x => x.IsActive && x.SemesterId == semesterId);
        if (!string.IsNullOrEmpty(batchExact))
        {
            q = q.Where(x => x.Batch == batchExact);
        }

        if (!string.IsNullOrEmpty(moduleNameExact))
        {
            q = q.Where(x => x.CurrentModule == moduleNameExact);
        }

        q = q.OrderByDescending(x => x.RiskScore).ThenBy(x => x.StudentId);
        var total = await q.CountAsync(ct);
        var skip = Math.Max(0, (page - 1) * pageSize);
        var items = await q.Skip(skip).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }
}
