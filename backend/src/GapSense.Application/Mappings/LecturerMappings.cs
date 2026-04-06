using GapSense.Application.DTOs.Responses;
using GapSense.Domain.Entities;

namespace GapSense.Application.Mappings;

public static class LecturerMappings
{
    public static LecturerProfileResponse ToResponse(this LecturerProfile e) =>
        new(e.Id, e.FullName, e.Email, e.PhoneNumber, e.Department, e.IsActive, e.CreatedAt, e.UpdatedAt);

    public static LecturerAcademicSettingsResponse ToResponse(this LecturerAcademicSettings e) =>
        new(e.Id, e.LecturerProfileId, e.AcademicYear, e.Semester, e.DefaultModule, e.AssignedFaculty, e.IsActive, e.CreatedAt, e.UpdatedAt);

    public static LecturerNotificationSettingsResponse ToResponse(this LecturerNotificationSettings e) =>
        new(e.Id, e.LecturerProfileId, e.EmailAlerts, e.StudentRiskAlerts, e.AssignmentReminders, e.WeeklyReports, e.IsActive, e.CreatedAt, e.UpdatedAt);

    public static LecturerSecuritySettingsResponse ToResponse(this LecturerSecuritySettings e) =>
        new(e.Id, e.LecturerProfileId, e.TwoFactorEnabled, e.LastLogoutAllDevicesUtc, !string.IsNullOrEmpty(e.PasswordHash), e.IsActive, e.CreatedAt, e.UpdatedAt);
}
