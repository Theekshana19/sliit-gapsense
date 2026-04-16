namespace GapSense.Application.DTOs.Responses;

/// <summary>
/// API DTO for semesters. Dates are ISO strings (yyyy-MM-dd) for reliable JSON across clients.
/// </summary>
public sealed record SemesterResponse(
    Guid Id,
    string Name,
    string AcademicYear,
    int Term,
    bool IsCurrent,
    string StartDate,
    string EndDate,
    bool IsActive
);
