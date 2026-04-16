using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface IDashboardService
{
    Task<DashboardSummaryResponse> GetSummaryAsync(Guid? semesterId, CancellationToken ct);
    Task<DashboardReadinessTrendResponse> GetReadinessTrendAsync(Guid? semesterId, CancellationToken ct);
    Task<DashboardRiskDistributionResponse> GetRiskDistributionAsync(Guid? semesterId, CancellationToken ct);
    Task<DashboardFullResponse> GetFullAsync(Guid? semesterId, CancellationToken ct);
}
