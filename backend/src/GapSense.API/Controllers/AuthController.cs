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
    private static readonly string[] AllowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    private const long MaxProfileImageBytes = 5 * 1024 * 1024;

    private readonly IAuthService _service;
    private readonly IWebHostEnvironment _environment;

    public AuthController(IAuthService service, IWebHostEnvironment environment)
    {
        _service = service;
        _environment = environment;
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

    [Authorize]
    [HttpPut("me")]
    public async Task<ActionResult<ApiResponse<UserProfileResponse>>> UpdateMe(
        [FromBody] UpdateMyProfileRequest request,
        CancellationToken cancellationToken)
    {
        var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(idValue) || !Guid.TryParse(idValue, out var userId))
            return BadRequest(ApiResponse<UserProfileResponse>.Fail("Invalid token user id."));

        try
        {
            var profile = await _service.UpdateMeAsync(userId, request, cancellationToken);
            return Ok(ApiResponse<UserProfileResponse>.Ok(profile, "Profile updated successfully."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<UserProfileResponse>.Fail(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message == "User not found.")
                return NotFound(ApiResponse<UserProfileResponse>.Fail(ex.Message));

            return Conflict(ApiResponse<UserProfileResponse>.Fail(ex.Message));
        }
    }

    [Authorize]
    [HttpPost("me/photo")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxProfileImageBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxProfileImageBytes)]
    public async Task<ActionResult<ApiResponse<UserProfileResponse>>> UploadPhoto(
        IFormFile? file,
        CancellationToken cancellationToken)
    {
        var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(idValue) || !Guid.TryParse(idValue, out var userId))
            return BadRequest(ApiResponse<UserProfileResponse>.Fail("Invalid token user id."));

        if (file is null || file.Length == 0)
            return BadRequest(ApiResponse<UserProfileResponse>.Fail("No image file was uploaded."));

        if (file.Length > MaxProfileImageBytes)
            return BadRequest(ApiResponse<UserProfileResponse>.Fail("Image exceeds the maximum size of 5 MB."));

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(ext) || !AllowedImageExtensions.Contains(ext))
            return BadRequest(ApiResponse<UserProfileResponse>.Fail("Only image files (.jpg, .jpeg, .png, .webp) are allowed."));

        if (string.IsNullOrWhiteSpace(_environment.WebRootPath))
            return StatusCode(500, ApiResponse<UserProfileResponse>.Fail("Web root is not configured."));

        try
        {
            var current = await _service.GetMeAsync(userId, cancellationToken);
            var uploadsDir = Path.Combine(_environment.WebRootPath, "uploads", "profiles");
            Directory.CreateDirectory(uploadsDir);

            var safeOriginal = Path.GetFileName(file.FileName);
            var storedFileName = $"{Guid.NewGuid():N}_{safeOriginal}";
            var physicalPath = Path.Combine(uploadsDir, storedFileName);

            await using (var stream = System.IO.File.Create(physicalPath))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            var webPath = "/uploads/profiles/" + storedFileName;
            var updated = await _service.UpdateProfilePhotoAsync(userId, webPath, cancellationToken);

            if (!string.IsNullOrWhiteSpace(current.ProfileImagePath) &&
                !string.Equals(current.ProfileImagePath, webPath, StringComparison.OrdinalIgnoreCase))
            {
                TryDeleteProfileImage(current.ProfileImagePath);
            }

            return Ok(ApiResponse<UserProfileResponse>.Ok(updated, "Profile photo updated successfully."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<UserProfileResponse>.Fail(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message == "User not found.")
                return NotFound(ApiResponse<UserProfileResponse>.Fail(ex.Message));

            return Conflict(ApiResponse<UserProfileResponse>.Fail(ex.Message));
        }
    }

    [Authorize]
    [HttpDelete("me/photo")]
    public async Task<ActionResult<ApiResponse<UserProfileResponse>>> RemovePhoto(CancellationToken cancellationToken)
    {
        var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(idValue) || !Guid.TryParse(idValue, out var userId))
            return BadRequest(ApiResponse<UserProfileResponse>.Fail("Invalid token user id."));

        try
        {
            var current = await _service.GetMeAsync(userId, cancellationToken);
            var updated = await _service.RemoveProfilePhotoAsync(userId, cancellationToken);

            if (!string.IsNullOrWhiteSpace(current.ProfileImagePath))
                TryDeleteProfileImage(current.ProfileImagePath);

            return Ok(ApiResponse<UserProfileResponse>.Ok(updated, "Profile photo removed successfully."));
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message == "User not found.")
                return NotFound(ApiResponse<UserProfileResponse>.Fail(ex.Message));

            return Conflict(ApiResponse<UserProfileResponse>.Fail(ex.Message));
        }
    }

    private void TryDeleteProfileImage(string? webRelativePath)
    {
        if (string.IsNullOrWhiteSpace(webRelativePath) || string.IsNullOrWhiteSpace(_environment.WebRootPath))
            return;

        var normalized = webRelativePath.Trim().Replace('\\', '/');
        if (!normalized.StartsWith("/uploads/profiles/", StringComparison.OrdinalIgnoreCase))
            return;

        var uploadsRoot = Path.GetFullPath(Path.Combine(_environment.WebRootPath, "uploads", "profiles"));
        var fileName = normalized.Split('/', StringSplitOptions.RemoveEmptyEntries).LastOrDefault();
        if (string.IsNullOrWhiteSpace(fileName))
            return;

        var fullPath = Path.GetFullPath(Path.Combine(uploadsRoot, fileName));
        if (!fullPath.StartsWith(uploadsRoot, StringComparison.OrdinalIgnoreCase))
            return;

        try
        {
            if (System.IO.File.Exists(fullPath))
                System.IO.File.Delete(fullPath);
        }
        catch
        {
            // best-effort cleanup
        }
    }
}

