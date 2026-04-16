namespace GapSense.Application.DTOs.Responses;

public sealed record AcademicModuleResponse(
    Guid Id,
    string ModuleCode,
    string ModuleName,
    Guid SemesterId,
    bool IsActive
);
