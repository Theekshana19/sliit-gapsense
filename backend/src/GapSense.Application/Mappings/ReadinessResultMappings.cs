using GapSense.Application.DTOs.Responses;
using GapSense.Domain.Entities;

namespace GapSense.Application.Mappings;

public static class ReadinessResultMappings
{
    public static ReadinessResultResponse ToResponse(this ReadinessResult e) =>
        new(
            e.Id,
            e.StudentId,
            e.ModuleCode,
            e.Batch,
            e.Semester,
            e.ReadinessScore,
            e.Status,
            e.IsActive,
            e.CreatedAt,
            e.UpdatedAt
        );
}

