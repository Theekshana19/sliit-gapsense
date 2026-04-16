using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;

namespace GapSense.Application.Interfaces.Services;

public interface IInterventionAssignmentService
{
    Task<IReadOnlyList<InterventionAssignmentResponse>> ListAsync(CancellationToken ct);
    Task<IReadOnlyList<InterventionAssignmentResponse>> ListByStudentAsync(Guid studentProfileId, CancellationToken ct);
    Task<InterventionAssignmentResponse?> GetAsync(Guid id, CancellationToken ct);
    Task<InterventionAssignmentResponse> CreateAsync(CreateInterventionAssignmentRequest request, CancellationToken ct);
    Task<InterventionAssignmentResponse?> UpdateAsync(Guid id, UpdateInterventionAssignmentRequest request, CancellationToken ct);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct);
}
