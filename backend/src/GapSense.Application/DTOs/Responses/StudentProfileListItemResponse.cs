namespace GapSense.Application.DTOs.Responses;

public sealed record StudentProfileListItemResponse(
    Guid Id,
    string StudentId,
    string FullName,
    string Email,
    string CurrentModule,
    string RiskLevel,
    decimal RiskScore,
    IReadOnlyList<string> WeakTopicNames,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
