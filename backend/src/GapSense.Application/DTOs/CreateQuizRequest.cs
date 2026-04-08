namespace GapSense.Application.DTOs;

public record CreateQuizRequest
{
    public required string Title { get; init; }
    public required string ModuleCode { get; init; }
    public string? Description { get; init; }
    public bool IsPublished { get; init; }
}
