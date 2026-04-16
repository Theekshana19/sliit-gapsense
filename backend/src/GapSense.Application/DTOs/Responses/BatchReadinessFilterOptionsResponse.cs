namespace GapSense.Application.DTOs.Responses;

public sealed record BatchReadinessSemesterOptionResponse(Guid Id, string Name, string AcademicYear, bool IsCurrent);

public sealed record BatchReadinessModuleOptionResponse(Guid Id, string ModuleCode, string ModuleName);

public sealed record BatchReadinessIntakeOptionResponse(string BatchCode, string DisplayLabel);

public sealed record BatchReadinessFilterOptionsResponse(
    IReadOnlyList<BatchReadinessSemesterOptionResponse> Semesters,
    IReadOnlyList<BatchReadinessModuleOptionResponse> Modules,
    IReadOnlyList<BatchReadinessIntakeOptionResponse> Intakes);
