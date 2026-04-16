using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface IInterventionPlanningService
{
    Task<IReadOnlyList<InterventionPlanTableRowResponse>> ListActiveAsync(CancellationToken ct);

    Task<IReadOnlyList<InterventionPlanTableRowResponse>> SearchAsync(InterventionPlansSearchRequest request, CancellationToken ct);

    Task<InterventionPlanTableRowResponse?> GetAsync(Guid id, CancellationToken ct);

    Task<InterventionPlanTableRowResponse> CreateAsync(CreateInterventionPlanRequest request, CancellationToken ct);

    Task<bool> SoftDeleteAsync(Guid id, CancellationToken ct);

    Task<InterventionPlanningDashboardResponse> GetDashboardAsync(CancellationToken ct);
}
