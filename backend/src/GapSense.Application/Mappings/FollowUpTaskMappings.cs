using GapSense.Application.DTOs.Responses;
using GapSense.Domain.Entities;
using GapSense.Domain.Enums;

namespace GapSense.Application.Mappings;

public static class FollowUpTaskMappings
{
    public static FollowUpTaskResponse ToResponse(this FollowUpTask x) =>
        new(
            x.Id,
            x.StudentProfileId,
            x.StudentProfile?.StudentId,
            x.StudentProfile?.FullName,
            x.StudentProfile?.CurrentModule,
            x.Title,
            x.Description,
            x.DueDate,
            x.Status.ToString("G"),
            x.Priority.ToString("G"),
            x.AssignedTo,
            x.ReminderSentAt,
            x.IsDismissed,
            x.IsActive,
            x.CreatedAt,
            x.UpdatedAt);
}
