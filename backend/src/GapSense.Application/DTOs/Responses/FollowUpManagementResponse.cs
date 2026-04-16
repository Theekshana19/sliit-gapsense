namespace GapSense.Application.DTOs.Responses;

public sealed record FollowUpManagementResponse(
    int TotalCount,
    int OverdueCount,
    int PendingCount,
    IReadOnlyList<string> ModuleOptions,
    IReadOnlyList<FollowUpTaskResponse> Items,
    IReadOnlyList<FollowUpRecentNoteResponse> RecentNotes,
    FollowUpTrendResponse Trend,
    IReadOnlyList<FollowUpActiveProgramResponse> ActivePrograms
);

public sealed record FollowUpRecentNoteResponse(
    Guid Id,
    string LecturerName,
    string StudentName,
    string NoteText,
    DateTime CreatedAt
);

public sealed record FollowUpTrendResponse(
    decimal CompletionRatePercent,
    decimal ChangePercent,
    IReadOnlyList<int> MonthlyCompletionPercents
);

public sealed record FollowUpActiveProgramResponse(
    string ProgramName,
    int StudentCount,
    decimal Percentage
);
