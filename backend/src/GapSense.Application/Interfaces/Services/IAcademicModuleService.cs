using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface IAcademicModuleService
{
    Task<IReadOnlyList<AcademicModuleResponse>> ListAsync(Guid? semesterId, CancellationToken ct);
}
