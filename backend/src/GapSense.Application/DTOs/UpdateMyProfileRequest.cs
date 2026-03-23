namespace GapSense.Application.DTOs;

public record UpdateMyProfileRequest
{
    public required string FullName { get; init; }

    // Student fields
    public string? Batch { get; init; }
    public string? DegreeProgram { get; init; }

    // Lecturer fields
    public string? Department { get; init; }
    public string? Specialization { get; init; }

    // Admin fields
    public string? AdminCode { get; init; }
}

