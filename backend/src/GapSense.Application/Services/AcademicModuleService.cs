using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Domain.Entities;

namespace GapSense.Application.Services;

public sealed class AcademicModuleService : IAcademicModuleService
{
    private readonly IAcademicModuleRepository _modules;
    private readonly ISemesterRepository _semesters;

    public AcademicModuleService(IAcademicModuleRepository modules, ISemesterRepository semesters)
    {
        _modules = modules;
        _semesters = semesters;
    }

    public async Task<IReadOnlyList<AcademicModuleResponse>> ListAsync(Guid? semesterId, CancellationToken ct)
    {
        var sid = await ResolveSemesterIdAsync(semesterId, ct);
        var list = await _modules.ListBySemesterAsync(sid, ct);
        return list.Select(m => new AcademicModuleResponse(m.Id, m.ModuleCode, m.ModuleName, m.SemesterId, m.IsActive)).ToList();
    }

    private async Task<Guid> ResolveSemesterIdAsync(Guid? semesterId, CancellationToken ct)
    {
        if (semesterId is { } id && id != Guid.Empty)
        {
            var sem = await _semesters.GetByIdAsync(id, ct);
            if (sem is null)
            {
                throw new ArgumentException("The selected semester was not found.");
            }

            return id;
        }

        var current = await _semesters.GetCurrentAsync(ct);
        if (current is null)
        {
            throw new ArgumentException("No current semester is configured. Pass semesterId or seed semesters.");
        }

        return current.Id;
    }
}
