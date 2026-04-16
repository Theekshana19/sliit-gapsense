using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

public sealed class ReportExport : BaseEntity
{
    public required string ReportType { get; set; }
    public required string Format { get; set; }
    public required string FileName { get; set; }
    public required string ContentType { get; set; }
    public required byte[] FileContent { get; set; }
    public long FileSizeBytes { get; set; }
    public required string Status { get; set; }
    public required string Batch { get; set; }
    public string? ModuleCode { get; set; }
    public Guid SemesterId { get; set; }
    public required string SemesterName { get; set; }
    public required string GeneratedBy { get; set; }
}
