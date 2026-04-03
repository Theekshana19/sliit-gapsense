using System.Security.Claims;
using GapSense.API.Models;
using GapSense.Application.DTOs;
using GapSense.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

[ApiController]
[Route("api/quiz-attempts")]
[Authorize]
public class QuizAttemptsController : ControllerBase
{
    private readonly IQuizAttemptService _attemptService;

    public QuizAttemptsController(IQuizAttemptService attemptService)
    {
        _attemptService = attemptService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<QuizAttemptResponse>>>> GetMyAttempts(
        CancellationToken cancellationToken)
    {
        var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(idValue) || !Guid.TryParse(idValue, out var userId))
            return Unauthorized(ApiResponse<IReadOnlyList<QuizAttemptResponse>>.Fail("Invalid user."));

        var items = await _attemptService.GetForUserAsync(userId, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<QuizAttemptResponse>>.Ok(items));
    }
}
