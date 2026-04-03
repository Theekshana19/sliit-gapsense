namespace GapSense.Application.DTOs;

public record QuizResponse
{
    public required Guid Id { get; init; }
    public required string Title { get; init; }
    public required string ModuleCode { get; init; }
    public string? Description { get; init; }
    public required bool IsPublished { get; init; }
    public Guid? CreatedByUserId { get; init; }
    public required DateTime CreatedAtUtc { get; init; }
    public required DateTime UpdatedAtUtc { get; init; }
}
