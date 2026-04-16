using System.Security.Cryptography;
using System.Text;
using GapSense.Application.DTOs.Requests;
using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Domain.Entities;

namespace GapSense.Application.Services;

public sealed class LecturerSettingsService : ILecturerSettingsService
{
    private readonly ILecturerProfileRepository _profiles;
    private readonly ILecturerAcademicSettingsRepository _academic;
    private readonly ILecturerNotificationSettingsRepository _notifications;
    private readonly ILecturerSecuritySettingsRepository _security;

    public LecturerSettingsService(
        ILecturerProfileRepository profiles,
        ILecturerAcademicSettingsRepository academic,
        ILecturerNotificationSettingsRepository notifications,
        ILecturerSecuritySettingsRepository security)
    {
        _profiles = profiles;
        _academic = academic;
        _notifications = notifications;
        _security = security;
    }

    public async Task<LecturerSettingsBundleResponse> GetBundleAsync(CancellationToken ct)
    {
        var state = await EnsureStateAsync(ct);
        return new LecturerSettingsBundleResponse(
            ToProfile(state.Profile),
            ToAcademic(state.Academic),
            ToNotifications(state.Notifications),
            ToSecurity(state.Security));
    }

    public async Task<LecturerProfileResponse> GetProfileAsync(CancellationToken ct)
    {
        var state = await EnsureStateAsync(ct);
        return ToProfile(state.Profile);
    }

    public async Task<LecturerProfileResponse> UpdateProfileAsync(UpdateLecturerProfileRequest request, CancellationToken ct)
    {
        var state = await EnsureStateAsync(ct);
        state.Profile.FullName = request.FullName.Trim();
        state.Profile.Email = request.Email.Trim();
        state.Profile.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();
        state.Profile.Department = request.Department.Trim();
        state.Profile.UpdatedAt = DateTime.UtcNow;
        await _profiles.UpdateAsync(state.Profile, ct);
        return ToProfile(state.Profile);
    }

    public async Task<LecturerAcademicSettingsResponse> GetAcademicAsync(CancellationToken ct)
    {
        var state = await EnsureStateAsync(ct);
        return ToAcademic(state.Academic);
    }

    public async Task<LecturerAcademicSettingsResponse> UpdateAcademicAsync(UpdateLecturerAcademicSettingsRequest request, CancellationToken ct)
    {
        var state = await EnsureStateAsync(ct);
        state.Academic.Semester = request.Semester.Trim();
        state.Academic.AcademicYear = request.AcademicYear.Trim();
        state.Academic.DefaultModule = request.DefaultModule.Trim();
        state.Academic.AssignedFaculty = request.AssignedFaculty.Trim();
        state.Academic.UpdatedAt = DateTime.UtcNow;
        await _academic.UpdateAsync(state.Academic, ct);
        return ToAcademic(state.Academic);
    }

    public async Task<LecturerNotificationSettingsResponse> GetNotificationsAsync(CancellationToken ct)
    {
        var state = await EnsureStateAsync(ct);
        return ToNotifications(state.Notifications);
    }

    public async Task<LecturerNotificationSettingsResponse> UpdateNotificationsAsync(UpdateLecturerNotificationSettingsRequest request, CancellationToken ct)
    {
        var state = await EnsureStateAsync(ct);
        state.Notifications.EmailAlerts = request.EmailAlerts;
        state.Notifications.StudentRiskAlerts = request.StudentRiskAlerts;
        state.Notifications.AssignmentReminders = request.AssignmentReminders;
        state.Notifications.WeeklyReports = request.WeeklyReports;
        state.Notifications.UpdatedAt = DateTime.UtcNow;
        await _notifications.UpdateAsync(state.Notifications, ct);
        return ToNotifications(state.Notifications);
    }

    public async Task<LecturerSecuritySettingsResponse> GetSecurityAsync(CancellationToken ct)
    {
        var state = await EnsureStateAsync(ct);
        return ToSecurity(state.Security);
    }

    public async Task<LecturerSecuritySettingsResponse> UpdateSecurityAsync(UpdateLecturerSecuritySettingsRequest request, CancellationToken ct)
    {
        var state = await EnsureStateAsync(ct);
        state.Security.TwoFactorEnabled = request.TwoFactorEnabled;
        state.Security.LoginAlertEnabled = request.LoginAlertEnabled;
        state.Security.SessionTimeoutMinutes = request.SessionTimeoutMinutes;
        state.Security.UpdatedAt = DateTime.UtcNow;

        var wantsPasswordUpdate = !string.IsNullOrWhiteSpace(request.NewPassword)
            || !string.IsNullOrWhiteSpace(request.ConfirmPassword)
            || !string.IsNullOrWhiteSpace(request.CurrentPassword);
        if (wantsPasswordUpdate)
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword))
            {
                throw new ArgumentException("Current password is required to update password.");
            }

            var currentHash = Hash(request.CurrentPassword);
            if (!string.Equals(state.Security.PasswordHash ?? Hash("admin123"), currentHash, StringComparison.Ordinal))
            {
                throw new ArgumentException("Current password is incorrect.");
            }

            state.Security.PasswordHash = Hash(request.NewPassword!);
            state.Security.PasswordChangedAtUtc = DateTime.UtcNow;
        }

        await _security.UpdateAsync(state.Security, ct);
        return ToSecurity(state.Security);
    }

    public async Task LogoutAllDevicesAsync(CancellationToken ct)
    {
        var state = await EnsureStateAsync(ct);
        state.Security.UpdatedAt = DateTime.UtcNow;
        await _security.UpdateAsync(state.Security, ct);
    }

    private async Task<(LecturerProfile Profile, LecturerAcademicSettings Academic, LecturerNotificationSettings Notifications, LecturerSecuritySettings Security)> EnsureStateAsync(CancellationToken ct)
    {
        var profile = await _profiles.GetDefaultActiveAsync(ct);
        if (profile is null)
        {
            profile = new LecturerProfile
            {
                FullName = "Lecturer User",
                Email = "lecturer@gapsense.local",
                PhoneNumber = string.Empty,
                Department = "Faculty of Computing"
            };
            await _profiles.AddAsync(profile, ct);
        }

        var academic = await _academic.GetByLecturerIdAsync(profile.Id, ct);
        if (academic is null)
        {
            academic = new LecturerAcademicSettings
            {
                LecturerProfileId = profile.Id,
                Semester = "Semester 1",
                AcademicYear = $"{DateTime.UtcNow.Year}/{DateTime.UtcNow.Year + 1}",
                DefaultModule = "SE101",
                AssignedFaculty = profile.Department
            };
            await _academic.AddAsync(academic, ct);
        }

        var notifications = await _notifications.GetByLecturerIdAsync(profile.Id, ct);
        if (notifications is null)
        {
            notifications = new LecturerNotificationSettings
            {
                LecturerProfileId = profile.Id,
                EmailAlerts = true,
                StudentRiskAlerts = true,
                AssignmentReminders = false,
                WeeklyReports = true
            };
            await _notifications.AddAsync(notifications, ct);
        }

        var security = await _security.GetByLecturerIdAsync(profile.Id, ct);
        if (security is null)
        {
            security = new LecturerSecuritySettings
            {
                LecturerProfileId = profile.Id,
                TwoFactorEnabled = false,
                LoginAlertEnabled = true,
                SessionTimeoutMinutes = 30,
                PasswordHash = Hash("admin123")
            };
            await _security.AddAsync(security, ct);
        }

        return (profile, academic, notifications, security);
    }

    private static LecturerProfileResponse ToProfile(LecturerProfile profile) =>
        new(profile.Id, profile.FullName, profile.Email, profile.PhoneNumber ?? string.Empty, profile.Department);

    private static LecturerAcademicSettingsResponse ToAcademic(LecturerAcademicSettings academic) =>
        new(academic.Id, academic.Semester, academic.AcademicYear, academic.DefaultModule, academic.AssignedFaculty);

    private static LecturerNotificationSettingsResponse ToNotifications(LecturerNotificationSettings notifications) =>
        new(notifications.Id, notifications.EmailAlerts, notifications.StudentRiskAlerts, notifications.AssignmentReminders, notifications.WeeklyReports);

    private static LecturerSecuritySettingsResponse ToSecurity(LecturerSecuritySettings security) =>
        new(security.Id, security.TwoFactorEnabled, security.LoginAlertEnabled, security.SessionTimeoutMinutes);

    private static string Hash(string value)
    {
        var bytes = Encoding.UTF8.GetBytes(value);
        var hashBytes = SHA256.HashData(bytes);
        return Convert.ToHexString(hashBytes);
    }
}
