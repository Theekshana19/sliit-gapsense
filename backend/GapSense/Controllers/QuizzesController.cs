using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GapSense.Data;
using GapSense.Models.Entities;
using GapSense.Models.DTOs.Common;
using GapSense.Models.DTOs.Readiness;

namespace GapSense.Controllers;

// handles all API requests related to quizzes
// base route: /api/quizzes
[ApiController]
[Route("api/[controller]")]
public class QuizzesController : ControllerBase
{
    private readonly AppDbContext _db;

    public QuizzesController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/quizzes - get all quizzes
    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<List<QuizDto>>>> GetQuizzes()
    {
        var quizzes = await _db.Quizzes
            .Include(q => q.Module)
            .Include(q => q.QuizQuestions)
            .OrderByDescending(q => q.CreatedAt)
            .Select(q => new QuizDto
            {
                Id = q.Id,
                Title = q.Title,
                Description = q.Description,
                Module = q.Module.ModuleName,
                ModuleCode = q.Module.ModuleCode,
                Intake = q.Intake,
                Questions = q.QuizQuestions.OrderBy(qq => qq.SortOrder).Select(qq => new QuizQuestionDto
                {
                    QuestionId = qq.QuestionId.ToString(),
                    Order = qq.SortOrder,
                    Marks = qq.Marks,
                }).ToList(),
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
            })
            .ToListAsync();

        return Ok(ApiResponseDto<List<QuizDto>>.SuccessResponse(quizzes));
    }

    // GET /api/quizzes/{id} - get a single quiz with its questions
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<QuizDto>>> GetQuiz(Guid id)
    {
        var quiz = await _db.Quizzes
            .Include(q => q.Module)
            .Include(q => q.QuizQuestions)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quiz == null)
            return NotFound(ApiResponseDto<QuizDto>.ErrorResponse("Quiz not found"));

        var dto = new QuizDto
        {
            Id = quiz.Id,
            Title = quiz.Title,
            Description = quiz.Description,
            Module = quiz.Module.ModuleName,
            ModuleCode = quiz.Module.ModuleCode,
            Intake = quiz.Intake,
            Questions = quiz.QuizQuestions.OrderBy(qq => qq.SortOrder).Select(qq => new QuizQuestionDto
            {
                QuestionId = qq.QuestionId.ToString(),
                Order = qq.SortOrder,
                Marks = qq.Marks,
            }).ToList(),
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

        return Ok(ApiResponseDto<QuizDto>.SuccessResponse(dto));
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
    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<QuizDto>>> CreateQuiz(CreateQuizDto dto)
    {
        // check module exists
        var module = await _db.Modules.FindAsync(dto.ModuleId);
        if (module == null)
            return BadRequest(ApiResponseDto<QuizDto>.ErrorResponse("Module not found"));

        // check at least one question
        if (dto.Questions.Count == 0)
            return BadRequest(ApiResponseDto<QuizDto>.ErrorResponse("At least one question is required"));

        // calculate total marks from questions
        var totalMarks = dto.Questions.Sum(q => q.Marks);

        var quiz = new Quiz
        {
            Title = dto.Title,
            Description = dto.Description,
            ModuleId = dto.ModuleId,
            Intake = dto.Intake,
            TotalMarks = totalMarks,
            PassingPercentage = dto.PassingPercentage,
            TimeLimitMinutes = dto.TimeLimitMinutes,
            MaxAttempts = dto.MaxAttempts,
            ShuffleQuestions = dto.ShuffleQuestions,
            ShuffleOptions = dto.ShuffleOptions,
            Status = dto.Status,
        };

        // add questions to quiz
        foreach (var qq in dto.Questions)
        {
            quiz.QuizQuestions.Add(new QuizQuestion
            {
                QuestionId = qq.QuestionId,
                SortOrder = qq.Order,
                Marks = qq.Marks,
            });
        }

        _db.Quizzes.Add(quiz);
        await _db.SaveChangesAsync();

        // return created quiz
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
            Status = quiz.Status,
            CreatedAt = quiz.CreatedAt.ToString("yyyy-MM-dd"),
            UpdatedAt = quiz.UpdatedAt.ToString("yyyy-MM-dd"),
        };

        return CreatedAtAction(nameof(GetQuiz), new { id = quiz.Id },
            ApiResponseDto<QuizDto>.SuccessResponse(result, "Quiz created successfully"));
    }

    // DELETE /api/quizzes/{id} - delete a quiz
    [HttpDelete("{id}")]
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
}
