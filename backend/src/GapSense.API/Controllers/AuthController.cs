using System.Security.Claims;
using GapSense.API.Models;
using GapSense.Application.DTOs;
using GapSense.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _service;

    public AuthController(IAuthService service)
    {
        _service = service;
    }

    [HttpPost("signup/student")]
    public async Task<ActionResult<ApiResponse<UserProfileResponse>>> SignupStudent(
        [FromBody] StudentSignupRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var profile = await _service.SignupStudentAsync(request, cancellationToken);
            return Ok(ApiResponse<UserProfileResponse>.Ok(profile, "Student signed up successfully."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<UserProfileResponse>.Fail(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<UserProfileResponse>.Fail(ex.Message));
        }
    }

    [HttpPost("signup/lecturer")]
    public async Task<ActionResult<ApiResponse<UserProfileResponse>>> SignupLecturer(
        [FromBody] LecturerSignupRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var profile = await _service.SignupLecturerAsync(request, cancellationToken);
            return Ok(ApiResponse<UserProfileResponse>.Ok(profile, "Lecturer signed up successfully."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<UserProfileResponse>.Fail(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<UserProfileResponse>.Fail(ex.Message));
        }
    }

    [HttpPost("signup/admin")]
    public async Task<ActionResult<ApiResponse<UserProfileResponse>>> SignupAdmin(
        [FromBody] AdminSignupRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var profile = await _service.SignupAdminAsync(request, cancellationToken);
            return Ok(ApiResponse<UserProfileResponse>.Ok(profile, "Admin signed up successfully."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<UserProfileResponse>.Fail(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<UserProfileResponse>.Fail(ex.Message));
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var auth = await _service.LoginAsync(request, cancellationToken);
            return Ok(ApiResponse<AuthResponse>.Ok(auth, "Login successful."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<AuthResponse>.Fail(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message == "Invalid email or password.")
                return Unauthorized(ApiResponse<AuthResponse>.Fail(ex.Message));

            if (ex.Message == "User is inactive.")
                return StatusCode(403, ApiResponse<AuthResponse>.Fail(ex.Message));

            return Conflict(ApiResponse<AuthResponse>.Fail(ex.Message));
        }
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserProfileResponse>>> GetMe(
        CancellationToken cancellationToken)
    {
        var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(idValue) || !Guid.TryParse(idValue, out var userId))
            return BadRequest(ApiResponse<UserProfileResponse>.Fail("Invalid token user id."));

        try
        {
            var profile = await _service.GetMeAsync(userId, cancellationToken);
            return Ok(ApiResponse<UserProfileResponse>.Ok(profile));
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message == "User not found.")
                return NotFound(ApiResponse<UserProfileResponse>.Fail(ex.Message));

            return Conflict(ApiResponse<UserProfileResponse>.Fail(ex.Message));
        }
    }
}

