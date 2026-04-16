using GapSense.Application.Interfaces.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Repositories;

public sealed class AcademicModuleRepository : IAcademicModuleRepository
{
    private readonly GapSenseDbContext _db;

    public AcademicModuleRepository(GapSenseDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<AcademicModule>> ListBySemesterAsync(Guid semesterId, CancellationToken ct) =>
        await _db.AcademicModules.AsNoTracking()
            .Where(x => x.IsActive && x.SemesterId == semesterId)
            .OrderBy(x => x.ModuleCode)
            .ToListAsync(ct);

    public Task<AcademicModule?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _db.AcademicModules.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.IsActive, ct);

    public Task<bool> ExistsByCodeAsync(string moduleCode, CancellationToken ct) =>
        _db.AcademicModules.AsNoTracking()
            .AnyAsync(x => x.IsActive && x.ModuleCode == moduleCode, ct);
}
