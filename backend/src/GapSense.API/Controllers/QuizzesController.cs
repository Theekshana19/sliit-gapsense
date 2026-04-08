using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GapSense.Infrastructure.Persistence;
using GapSense.Domain.Entities;
using GapSense.Application.DTOs.Common;
using GapSense.Application.DTOs.Readiness;

namespace GapSense.API.Controllers;

// handles all API requests related to quizzes
// base route: /api/quizzes
[ApiController]
[Authorize]
[Route("api/[controller]")]
public class QuizzesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<QuizzesController> _logger;
    private readonly IWebHostEnvironment _env;

    public QuizzesController(ApplicationDbContext db, ILogger<QuizzesController> logger, IWebHostEnvironment env)
    {
        _db = db;
        _logger = logger;
        _env = env;
    }

    // GET /api/quizzes - get all quizzes
    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<List<QuizDto>>>> GetQuizzes()
    {
        // Load then map in memory — Guid.ToString() in IQueryable Select is not reliably translatable to SQL.
        var rows = await _db.Quizzes
            .AsNoTracking()
            .Include(q => q.Module)
            .Include(q => q.QuizQuestions)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();

        var quizzes = rows.Select(MapQuizToDto).ToList();
        return Ok(ApiResponseDto<List<QuizDto>>.SuccessResponse(quizzes));
    }

    // GET /api/quizzes/{id} - get a single quiz with its questions
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<QuizDto>>> GetQuiz(Guid id)
    {
        var quiz = await _db.Quizzes
            .AsNoTracking()
            .Include(q => q.Module)
            .Include(q => q.QuizQuestions)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quiz == null)
            return NotFound(ApiResponseDto<QuizDto>.ErrorResponse("Quiz not found"));

        return Ok(ApiResponseDto<QuizDto>.SuccessResponse(MapQuizToDto(quiz)));
    }

    // GET /api/quizzes/{id}/questions - get full question details for a quiz (for quiz attempt page)
    [HttpGet("{id}/questions")]
    public async Task<ActionResult<ApiResponseDto<List<QuestionDto>>>> GetQuizQuestions(Guid id)
    {
        var quiz = await _db.Quizzes
            .Include(q => q.QuizQuestions)
                .ThenInclude(qq => qq.Question)
                    .ThenInclude(q => q.Options)
            .Include(q => q.QuizQuestions)
                .ThenInclude(qq => qq.Question)
                    .ThenInclude(q => q.Module)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quiz == null)
            return NotFound(ApiResponseDto<List<QuestionDto>>.ErrorResponse("Quiz not found"));

        var questions = quiz.QuizQuestions
            .OrderBy(qq => qq.SortOrder)
            .Select(qq =>
            {
                var q = qq.Question;
                var correctOption = q.Options.FirstOrDefault(o => o.IsCorrect);
                return new QuestionDto
                {
                    Id = q.Id,
                    QuestionId = q.QuestionDisplayId,
                    Title = q.Title,
                    QuestionText = q.QuestionText,
                    QuestionType = q.QuestionType,
                    Difficulty = q.Difficulty,
                    Topic = q.Topic?.TopicName ?? "",
                    Module = q.Module.ModuleName,
                    ModuleCode = q.Module.ModuleCode,
                    Options = q.Options.OrderBy(o => o.SortOrder).Select(o => new QuestionOptionDto
                    {
                        Id = o.Id,
                        OptionText = o.OptionText,
                        IsCorrect = false, // don't reveal correct answer to student!
                    }).ToList(),
                    CorrectOptionId = "", // hidden from student
                    Explanation = "", // hidden until after submission
                    Marks = qq.Marks,
                    Status = q.Status,
                    CreatedAt = q.CreatedAt.ToString("yyyy-MM-dd"),
                    UpdatedAt = q.UpdatedAt.ToString("yyyy-MM-dd"),
                };
            })
            .ToList();

        return Ok(ApiResponseDto<List<QuestionDto>>.SuccessResponse(questions));
    }

    // POST /api/quizzes - create a new quiz with questions
    // only lecturers and admins can create quizzes
    [HttpPost]
    [Authorize(Roles = "admin,lecturer")]
    public async Task<ActionResult<ApiResponseDto<QuizDto>>> CreateQuiz([FromBody] CreateQuizDto? dto)
    {
        if (dto == null)
            return BadRequest(ApiResponseDto<QuizDto>.ErrorResponse("Request body is required."));

        // JSON "questions": null deserializes to null; .Count would throw → HTTP 500
        dto.Questions ??= new List<CreateQuizQuestionDto>();

        if (dto.ModuleId == Guid.Empty)
            return BadRequest(ApiResponseDto<QuizDto>.ErrorResponse("A valid moduleId (GUID) is required."));

        // check module exists
        var module = await _db.Modules.FindAsync(dto.ModuleId);
        if (module == null)
            return BadRequest(ApiResponseDto<QuizDto>.ErrorResponse("Module not found"));

        // check at least one question
        if (dto.Questions.Count == 0)
            return BadRequest(ApiResponseDto<QuizDto>.ErrorResponse("At least one question is required"));

        if (dto.Questions.Select(q => q.QuestionId).Distinct().Count() != dto.Questions.Count)
            return BadRequest(ApiResponseDto<QuizDto>.ErrorResponse("Each question may only appear once in a quiz."));

        var questionIds = dto.Questions.Select(q => q.QuestionId).Distinct().ToList();
        var existingIds = await _db.Questions
            .Where(q => questionIds.Contains(q.Id))
            .Select(q => q.Id)
            .ToListAsync();
        if (existingIds.Count != questionIds.Count)
            return BadRequest(ApiResponseDto<QuizDto>.ErrorResponse(
                "One or more question IDs are invalid. Use each question's API id (GUID), not the display code."));

        var wrongModule = await _db.Questions
            .Where(q => questionIds.Contains(q.Id) && q.ModuleId != dto.ModuleId)
            .AnyAsync();
        if (wrongModule)
            return BadRequest(ApiResponseDto<QuizDto>.ErrorResponse(
                "Every selected question must belong to the module you chose for this quiz."));

        var marksByQuestion = await _db.Questions
            .Where(q => questionIds.Contains(q.Id))
            .ToDictionaryAsync(q => q.Id, q => q.Marks);

        var quiz = new Quiz
        {
            Title = dto.Title,
            Description = dto.Description ?? string.Empty,
            ModuleId = dto.ModuleId,
            Intake = dto.Intake ?? string.Empty,
            PassingPercentage = dto.PassingPercentage,
            TimeLimitMinutes = dto.TimeLimitMinutes,
            MaxAttempts = dto.MaxAttempts,
            ShuffleQuestions = dto.ShuffleQuestions,
            ShuffleOptions = dto.ShuffleOptions,
            Status = NormalizeQuizStatus(dto.Status),
        };

        // QuizQuestion.Marks must be 1–100; frontend may send 0 — fall back to question bank marks.
        foreach (var qq in dto.Questions.OrderBy(x => x.Order))
        {
            var marks = qq.Marks < 1
                ? Math.Clamp(marksByQuestion.GetValueOrDefault(qq.QuestionId, 5), 1, 100)
                : Math.Clamp(qq.Marks, 1, 100);
            quiz.QuizQuestions.Add(new QuizQuestion
            {
                QuestionId = qq.QuestionId,
                SortOrder = qq.Order,
                Marks = marks,
            });
        }

        quiz.TotalMarks = quiz.QuizQuestions.Sum(x => x.Marks);

        _db.Quizzes.Add(quiz);
        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(ex, "CreateQuiz SaveChanges failed");
            var message =
                "Could not save the quiz. Check that the module and every question id exist in the database.";
            List<string>? errors = null;
            if (_env.IsDevelopment() && !string.IsNullOrWhiteSpace(ex.InnerException?.Message))
                errors = new List<string> { ex.InnerException.Message };
            return BadRequest(ApiResponseDto<QuizDto>.ErrorResponse(message, errors));
        }
        catch (Exception)
        {
            // Connection failures, timeouts, etc. are not always DbUpdateException
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                ApiResponseDto<QuizDto>.ErrorResponse(
                    "Database error while saving the quiz. Check API logs and the database connection."));
        }

        var result = new QuizDto
        {
            Id = quiz.Id,
            Title = quiz.Title,
            Description = quiz.Description,
            Module = module.ModuleName,
            ModuleCode = module.ModuleCode,
            Intake = quiz.Intake,
            TotalQuestions = quiz.QuizQuestions.Count,
            TotalMarks = quiz.TotalMarks,
            PassingMarks = (int)Math.Round(quiz.TotalMarks * quiz.PassingPercentage / 100.0),
            PassingPercentage = quiz.PassingPercentage,
            TimeLimitMinutes = quiz.TimeLimitMinutes,
            MaxAttempts = quiz.MaxAttempts,
            ShuffleQuestions = quiz.ShuffleQuestions,
            ShuffleOptions = quiz.ShuffleOptions,
            Status = quiz.Status,
            CreatedAt = quiz.CreatedAt.ToString("yyyy-MM-dd"),
            UpdatedAt = quiz.UpdatedAt.ToString("yyyy-MM-dd"),
        };

        // Use Ok instead of CreatedAtAction — route resolution failures there surface as HTTP 500
        return Ok(ApiResponseDto<QuizDto>.SuccessResponse(result, "Quiz created successfully"));
    }

    // PUT /api/quizzes/{id} - update an existing quiz with its questions
    // only lecturers and admins can update quizzes
    // blocks update if the quiz already has student submissions (data integrity)
    [HttpPut("{id}")]
    [Authorize(Roles = "admin,lecturer")]
    public async Task<ActionResult<ApiResponseDto<QuizDto>>> UpdateQuiz(Guid id, [FromBody] UpdateQuizDto? dto)
    {
        if (dto == null)
            return BadRequest(ApiResponseDto<QuizDto>.ErrorResponse("Request body is required."));

        dto.Questions ??= new List<CreateQuizQuestionDto>();

        // load the existing quiz with its questions
        var quiz = await _db.Quizzes
            .Include(q => q.QuizQuestions)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quiz == null)
            return NotFound(ApiResponseDto<QuizDto>.ErrorResponse("Quiz not found"));

        // block edit if any submissions exist - protects historical data
        var hasSubmissions = await _db.Submissions.AnyAsync(s => s.QuizId == id);
        if (hasSubmissions)
            return BadRequest(ApiResponseDto<QuizDto>.ErrorResponse(
                "Cannot edit this quiz because students have already submitted attempts. Create a new quiz instead."));

        if (dto.ModuleId == Guid.Empty)
            return BadRequest(ApiResponseDto<QuizDto>.ErrorResponse("A valid moduleId (GUID) is required."));

        // check module exists
        var module = await _db.Modules.FindAsync(dto.ModuleId);
        if (module == null)
            return BadRequest(ApiResponseDto<QuizDto>.ErrorResponse("Module not found"));

        if (dto.Questions.Count == 0)
            return BadRequest(ApiResponseDto<QuizDto>.ErrorResponse("At least one question is required"));

        if (dto.Questions.Select(q => q.QuestionId).Distinct().Count() != dto.Questions.Count)
            return BadRequest(ApiResponseDto<QuizDto>.ErrorResponse("Each question may only appear once in a quiz."));

        var questionIds = dto.Questions.Select(q => q.QuestionId).Distinct().ToList();
        var existingIds = await _db.Questions
            .Where(q => questionIds.Contains(q.Id))
            .Select(q => q.Id)
            .ToListAsync();
        if (existingIds.Count != questionIds.Count)
            return BadRequest(ApiResponseDto<QuizDto>.ErrorResponse(
                "One or more question IDs are invalid."));

        var wrongModule = await _db.Questions
            .Where(q => questionIds.Contains(q.Id) && q.ModuleId != dto.ModuleId)
            .AnyAsync();
        if (wrongModule)
            return BadRequest(ApiResponseDto<QuizDto>.ErrorResponse(
                "Every selected question must belong to the module you chose for this quiz."));

        var marksByQuestion = await _db.Questions
            .Where(q => questionIds.Contains(q.Id))
            .ToDictionaryAsync(q => q.Id, q => q.Marks);

        // update basic quiz fields
        quiz.Title = dto.Title;
        quiz.Description = dto.Description ?? string.Empty;
        quiz.ModuleId = dto.ModuleId;
        quiz.Intake = dto.Intake ?? string.Empty;
        quiz.PassingPercentage = dto.PassingPercentage;
        quiz.TimeLimitMinutes = dto.TimeLimitMinutes;
        quiz.MaxAttempts = dto.MaxAttempts;
        quiz.ShuffleQuestions = dto.ShuffleQuestions;
        quiz.ShuffleOptions = dto.ShuffleOptions;
        quiz.Status = NormalizeQuizStatus(dto.Status);
        quiz.UpdatedAt = DateTime.UtcNow;

        // replace all quiz questions - remove old ones first then add new ones
        var oldQuizQuestions = quiz.QuizQuestions.ToList();
        _db.QuizQuestions.RemoveRange(oldQuizQuestions);
        quiz.QuizQuestions.Clear();
        await _db.SaveChangesAsync();

        // add the new question assignments
        foreach (var qq in dto.Questions.OrderBy(x => x.Order))
        {
            var marks = qq.Marks < 1
                ? Math.Clamp(marksByQuestion.GetValueOrDefault(qq.QuestionId, 5), 1, 100)
                : Math.Clamp(qq.Marks, 1, 100);

            _db.QuizQuestions.Add(new QuizQuestion
            {
                QuizId = quiz.Id,
                QuestionId = qq.QuestionId,
                SortOrder = qq.Order,
                Marks = marks,
            });
        }

        // recalculate total marks from new questions
        quiz.TotalMarks = dto.Questions.Sum(qq =>
        {
            if (qq.Marks < 1) return Math.Clamp(marksByQuestion.GetValueOrDefault(qq.QuestionId, 5), 1, 100);
            return Math.Clamp(qq.Marks, 1, 100);
        });

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(ex, "UpdateQuiz SaveChanges failed");
            return BadRequest(ApiResponseDto<QuizDto>.ErrorResponse(
                "Could not save the quiz. Check that the module and questions exist."));
        }

        // build the response with the updated data
        var result = new QuizDto
        {
            Id = quiz.Id,
            Title = quiz.Title,
            Description = quiz.Description,
            Module = module.ModuleName,
            ModuleCode = module.ModuleCode,
            Intake = quiz.Intake,
            TotalQuestions = dto.Questions.Count,
            TotalMarks = quiz.TotalMarks,
            PassingMarks = (int)Math.Round(quiz.TotalMarks * quiz.PassingPercentage / 100.0),
            PassingPercentage = quiz.PassingPercentage,
            TimeLimitMinutes = quiz.TimeLimitMinutes,
            MaxAttempts = quiz.MaxAttempts,
            ShuffleQuestions = quiz.ShuffleQuestions,
            ShuffleOptions = quiz.ShuffleOptions,
            Status = quiz.Status,
            CreatedAt = quiz.CreatedAt.ToString("yyyy-MM-dd"),
            UpdatedAt = quiz.UpdatedAt.ToString("yyyy-MM-dd"),
        };

        return Ok(ApiResponseDto<QuizDto>.SuccessResponse(result, "Quiz updated successfully"));
    }

    // DELETE /api/quizzes/{id} - delete a quiz
    // only lecturers and admins can delete quizzes
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin,lecturer")]
    public async Task<ActionResult<ApiResponseDto<bool>>> DeleteQuiz(Guid id)
    {
        var quiz = await _db.Quizzes.FindAsync(id);
        if (quiz == null)
            return NotFound(ApiResponseDto<bool>.ErrorResponse("Quiz not found"));

        // check if quiz has submissions
        var hasSubmissions = await _db.Submissions.AnyAsync(s => s.QuizId == id);
        if (hasSubmissions)
            return BadRequest(ApiResponseDto<bool>.ErrorResponse(
                "Cannot delete this quiz because students have already submitted attempts."));

        _db.Quizzes.Remove(quiz);
        await _db.SaveChangesAsync();

        return Ok(ApiResponseDto<bool>.SuccessResponse(true, "Quiz deleted successfully"));
    }

    private static string NormalizeQuizStatus(string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
            return "Draft";
        var s = status.Trim();
        string[] allowed = ["Draft", "Published", "Scheduled", "Active", "Closed"];
        foreach (var a in allowed)
        {
            if (string.Equals(a, s, StringComparison.OrdinalIgnoreCase))
                return a;
        }

        return "Draft";
    }

    private static QuizDto MapQuizToDto(Quiz q)
    {
        var moduleName = q.Module?.ModuleName ?? string.Empty;
        var moduleCode = q.Module?.ModuleCode ?? string.Empty;
        return new QuizDto
        {
            Id = q.Id,
            Title = q.Title,
            Description = q.Description,
            Module = moduleName,
            ModuleCode = moduleCode,
            Intake = q.Intake ?? string.Empty,
            Questions = q.QuizQuestions
                .OrderBy(qq => qq.SortOrder)
                .Select(qq => new QuizQuestionDto
                {
                    QuestionId = qq.QuestionId.ToString(),
                    Order = qq.SortOrder,
                    Marks = qq.Marks,
                })
                .ToList(),
            TotalQuestions = q.QuizQuestions.Count,
            TotalMarks = q.TotalMarks,
            PassingMarks = (int)Math.Round(q.TotalMarks * q.PassingPercentage / 100.0),
            PassingPercentage = q.PassingPercentage,
            TimeLimitMinutes = q.TimeLimitMinutes,
            MaxAttempts = q.MaxAttempts,
            ShuffleQuestions = q.ShuffleQuestions,
            ShuffleOptions = q.ShuffleOptions,
            Status = q.Status,
            CreatedAt = q.CreatedAt.ToString("yyyy-MM-dd"),
            UpdatedAt = q.UpdatedAt.ToString("yyyy-MM-dd"),
        };
    }
}
