using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

public sealed class MonitoringNote : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile? StudentProfile { get; set; }
    public required string NoteType { get; set; }
    public required string NoteText { get; set; }
    public required string AddedBy { get; set; }
}
