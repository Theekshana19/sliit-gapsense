using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

public sealed class ReferralOrEscalation : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile? StudentProfile { get; set; }
    public required string ReferralType { get; set; }
    public required string ReferredTo { get; set; }
    public required string Reason { get; set; }
    public required string Status { get; set; }
    public required string CreatedBy { get; set; }
}
