using GapSense.Application.DTOs.Requests;
using GapSense.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/settings")]
public sealed class LecturerSettingsController : ControllerBase
{
    private readonly ILecturerSettingsService _settings;

    public LecturerSettingsController(ILecturerSettingsService settings)
    {
        _settings = settings;
    }

    [HttpGet("bundle")]
    public async Task<IActionResult> GetBundle(CancellationToken ct) => Ok(await _settings.GetBundleAsync(ct));

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile(CancellationToken ct) => Ok(await _settings.GetProfileAsync(ct));

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateLecturerProfileRequest request, CancellationToken ct) =>
        Ok(await _settings.UpdateProfileAsync(request, ct));

    [HttpGet("academic")]
    public async Task<IActionResult> GetAcademic(CancellationToken ct) => Ok(await _settings.GetAcademicAsync(ct));

    [HttpPut("academic")]
    public async Task<IActionResult> UpdateAcademic([FromBody] UpdateLecturerAcademicSettingsRequest request, CancellationToken ct) =>
        Ok(await _settings.UpdateAcademicAsync(request, ct));

    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications(CancellationToken ct) => Ok(await _settings.GetNotificationsAsync(ct));

    [HttpPut("notifications")]
    public async Task<IActionResult> UpdateNotifications([FromBody] UpdateLecturerNotificationSettingsRequest request, CancellationToken ct) =>
        Ok(await _settings.UpdateNotificationsAsync(request, ct));

    [HttpGet("security")]
    public async Task<IActionResult> GetSecurity(CancellationToken ct) => Ok(await _settings.GetSecurityAsync(ct));

    [HttpPut("security")]
    public async Task<IActionResult> UpdateSecurity([FromBody] UpdateLecturerSecuritySettingsRequest request, CancellationToken ct) =>
        Ok(await _settings.UpdateSecurityAsync(request, ct));

    [HttpPost("security/logout-all-devices")]
    public async Task<IActionResult> LogoutAllDevices(CancellationToken ct)
    {
        await _settings.LogoutAllDevicesAsync(ct);
        return NoContent();
    }
}
