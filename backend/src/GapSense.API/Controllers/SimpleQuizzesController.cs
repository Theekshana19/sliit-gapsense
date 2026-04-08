using System.Security.Claims;
using GapSense.API.Models;
using GapSense.Application.DTOs;
using GapSense.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GapSense.API.Controllers;

/// <summary>Legacy "simple" quizzes (module code + published flag). Sewwandi readiness uses <see cref="QuizzesController"/> at /api/quizzes.</summary>
[ApiController]
[Route("api/simple-quizzes")]
[Authorize]
public class SimpleQuizzesController : ControllerBase
{
    private readonly IQuizService _quizService;
    private readonly IQuizAttemptService _attemptService;

    public SimpleQuizzesController(IQuizService quizService, IQuizAttemptService attemptService)
    {
        _quizService = quizService;
        _attemptService = attemptService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<QuizResponse>>>> GetPublished(
        CancellationToken cancellationToken)
    {
        var items = await _quizService.GetPublishedAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<QuizResponse>>.Ok(items));
    }

    [HttpGet("all")]
    [Authorize(Roles = "admin,lecturer")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<QuizResponse>>>> GetAll(
        CancellationToken cancellationToken)
    {
        var items = await _quizService.GetAllAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<QuizResponse>>.Ok(items));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<QuizResponse>>> GetById(Guid id,
        CancellationToken cancellationToken)
    {
        var item = await _quizService.GetByIdAsync(id, cancellationToken);
        if (item is null)
            return NotFound(ApiResponse<QuizResponse>.Fail("Quiz not found."));
        return Ok(ApiResponse<QuizResponse>.Ok(item));
    }

    [HttpPost]
    [Authorize(Roles = "admin,lecturer")]
    public async Task<ActionResult<ApiResponse<QuizResponse>>> Create(
        [FromBody] CreateQuizRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(ApiResponse<QuizResponse>.Fail("Invalid user."));

        try
        {
            var created = await _quizService.CreateAsync(request, userId, cancellationToken);
            return Ok(ApiResponse<QuizResponse>.Ok(created, "Quiz created."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<QuizResponse>.Fail(ex.Message));
        }
    }

    [HttpPost("{quizId:guid}/attempts")]
    public async Task<ActionResult<ApiResponse<QuizAttemptResponse>>> SubmitAttempt(
        Guid quizId,
        [FromBody] SubmitQuizAttemptRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(ApiResponse<QuizAttemptResponse>.Fail("Invalid user."));

        try
        {
            var attempt = await _attemptService.SubmitAsync(quizId, userId, request, cancellationToken);
            return Ok(ApiResponse<QuizAttemptResponse>.Ok(attempt, "Attempt saved."));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<QuizAttemptResponse>.Fail(ex.Message));
        }
    }

    [HttpGet("{quizId:guid}/attempts")]
    [Authorize(Roles = "admin,lecturer")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<QuizAttemptResponse>>>> GetAttemptsForQuiz(
        Guid quizId,
        CancellationToken cancellationToken)
    {
        var items = await _attemptService.GetForQuizAsync(quizId, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<QuizAttemptResponse>>.Ok(items));
    }

    private bool TryGetUserId(out Guid userId)
    {
        userId = default;
        var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return !string.IsNullOrWhiteSpace(idValue) && Guid.TryParse(idValue, out userId);
    }
}
