using GapSense.Domain.Entities;

namespace GapSense.Application.Interfaces.Repositories;

public interface IAcademicModuleRepository
{
    Task<IReadOnlyList<AcademicModule>> ListBySemesterAsync(Guid semesterId, CancellationToken ct);

    Task<AcademicModule?> GetByIdAsync(Guid id, CancellationToken ct);

    Task<bool> ExistsByCodeAsync(string moduleCode, CancellationToken ct);
}
