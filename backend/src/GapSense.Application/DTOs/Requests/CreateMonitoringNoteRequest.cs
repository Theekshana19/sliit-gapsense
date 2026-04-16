namespace GapSense.Application.DTOs.Requests;

public sealed record CreateMonitoringNoteRequest(
    Guid StudentProfileId,
    string NoteType,
    string NoteText,
    string AddedBy
);
