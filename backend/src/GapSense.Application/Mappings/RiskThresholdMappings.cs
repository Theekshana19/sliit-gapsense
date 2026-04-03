using GapSense.Application.DTOs.Responses;
using GapSense.Domain.Entities;

namespace GapSense.Application.Mappings;

public static class RiskThresholdMappings
{
    public static RiskThresholdResponse ToResponse(this RiskThreshold e) =>
        new(
            e.Id,
            e.ModuleCode,
            e.Batch,
            e.Semester,
            e.HighRiskBelowPercent,
            e.MediumRiskBelowPercent,
            e.IsActive,
            e.CreatedAt,
            e.UpdatedAt
        );
}

