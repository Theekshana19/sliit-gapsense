using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface IStudentProfileRepository
{
    Task<IReadOnlyList<StudentProfile>> ListActiveBySemesterIdAsync(Guid semesterId, CancellationToken ct);

    Task<IReadOnlyList<StudentProfile>> ListActiveForMonitoringAsync(CancellationToken ct);
    Task<StudentProfile?> GetActiveByIdAsync(Guid id, CancellationToken ct);
    Task<StudentProfile?> GetActiveWithDetailsAsync(Guid id, CancellationToken ct);
    Task<StudentProfile?> GetTrackedActiveByIdAsync(Guid id, CancellationToken ct);
    Task<bool> StudentIdExistsAsync(string studentId, Guid? excludeId, CancellationToken ct);
    Task AddAsync(StudentProfile entity, CancellationToken ct);
    Task UpdateAsync(StudentProfile entity, CancellationToken ct);

    Task<IReadOnlyList<string>> GetDistinctBatchesForSemesterAsync(Guid semesterId, CancellationToken ct);
    Task<bool> BatchExistsAsync(string batch, CancellationToken ct);

    Task<(int Total, int HighRisk, double AvgReadiness, decimal? ImprovingSharePercent, double? BaselineAvgReadiness)> GetBatchReadinessAggregatesAsync(
        Guid semesterId,
        string? batchExact,
        string? moduleNameExact,
        CancellationToken ct);

    Task<(IReadOnlyList<StudentProfile> Items, int TotalCount)> GetBatchReadinessLedgerPageAsync(
        Guid semesterId,
        string? batchExact,
        string? moduleNameExact,
        int page,
        int pageSize,
        CancellationToken ct);
}
