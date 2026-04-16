using GapSense.Domain.Common;

namespace GapSense.Domain.Entities;

/// <summary>
/// A module (course unit) offered in a given semester. Named AcademicModule to avoid confusion with .NET module concept.
/// </summary>
public sealed class AcademicModule : BaseEntity
{
    public required string ModuleCode { get; set; }
    public required string ModuleName { get; set; }
    public Guid SemesterId { get; set; }
    public Semester Semester { get; set; } = null!;
}
