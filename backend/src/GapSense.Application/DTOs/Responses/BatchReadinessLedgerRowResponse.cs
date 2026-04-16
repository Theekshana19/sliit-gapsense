namespace GapSense.Application.DTOs.Responses;

public sealed record BatchReadinessLedgerRowResponse(
    Guid StudentProfileId,
    string StudentId,
    string FullName,
    string AvatarUrl,
    string Module,
    int ScorePercent,
    string RiskUi,
    string StatusUi);
