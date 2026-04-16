namespace GapSense.Application.DTOs.Responses;

public sealed record LecturerSettingsBundleResponse(
    LecturerProfileResponse Profile,
    LecturerAcademicSettingsResponse Academic,
    LecturerNotificationSettingsResponse Notifications,
    LecturerSecuritySettingsResponse Security
);
