namespace GapSense.Application.DTOs.Readiness;

public sealed class BatchReadinessOverviewResponse
{
    public int TotalStudents { get; init; }

    public int HighRiskCount { get; init; }

    /// <summary>Average percentage of latest graded/submitted attempt per student (0–100).</summary>
    public int BatchReadinessScore { get; init; }

    public IReadOnlyList<BatchReadinessLedgerRowDto> LedgerRows { get; init; } =
        Array.Empty<BatchReadinessLedgerRowDto>();
}

public sealed class BatchReadinessLedgerRowDto
{
    public string Id { get; init; } = string.Empty;

    public string StudentId { get; init; } = string.Empty;

    public string Name { get; init; } = string.Empty;

    public string AvatarUrl { get; init; } = string.Empty;

    public string Module { get; init; } = string.Empty;

    public int Score { get; init; }

    /// <summary>high | medium | low</summary>
    public string Risk { get; init; } = "low";

    /// <summary>intervention | monitoring | on_track (derived from score for this overview).</summary>
    public string Status { get; init; } = "on_track";
}
