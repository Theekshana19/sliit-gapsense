using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

public sealed class InterventionReview : BaseEntity
{
    public Guid InterventionPlanId { get; set; }
    public InterventionPlan InterventionPlan { get; set; } = null!;
    public DateOnly ReviewDate { get; set; }
    public required string Outcome { get; set; }
    public decimal ImprovementPercentage { get; set; }
    public bool IsCompleted { get; set; }
}
