using GapSense.Application.DTOs.Responses;
using GapSense.Domain.Entities;

namespace GapSense.Application.Mappings;

public static class InAppNotificationMappings
{
    public static InAppNotificationResponse ToResponse(this InAppNotification e) =>
        new(e.Id, e.LecturerProfileId, e.Title, e.Message, e.Type, e.IsRead, e.IsActive, e.CreatedAt, e.UpdatedAt);
}
