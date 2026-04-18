using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GapSense.Infrastructure.Persistence;
using GapSense.Domain.Entities;
using GapSense.Application.DTOs.Common;
using GapSense.Application.DTOs.Readiness;

namespace GapSense.API.Controllers;

// handles all API requests related to readiness quiz questions
// base route: /api/questions
[ApiController]
[Authorize]
[Route("api/[controller]")]
public class QuestionsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public QuestionsController(ApplicationDbContext db)
    {
        _db = db;
    }

    // GET /api/questions - get all questions with optional filters
    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<List<QuestionDto>>>> GetQuestions(
        [FromQuery] string? search,
        [FromQuery] string? module,
        [FromQuery] Guid? moduleId,
        [FromQuery] string? topic,
        [FromQuery] string? difficulty,
        [FromQuery] string? status)
    {
        var query = _db.Questions
            .Include(q => q.Options)
            .Include(q => q.Module)
            .Include(q => q.Topic)
            .AsQueryable();

        if (moduleId.HasValue)
        {
            query = query.Where(q => q.ModuleId == moduleId.Value);
        }

        // apply filters
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(q =>
                q.Title.Contains(search) ||
                q.QuestionDisplayId.Contains(search) ||
                q.Module.ModuleCode.Contains(search));
        }

        if (!string.IsNullOrEmpty(module))
            query = query.Where(q => q.Module.ModuleName == module || q.Module.ModuleCode == module);

        if (!string.IsNullOrEmpty(topic))
            query = query.Where(q => q.Topic != null && q.Topic.TopicName == topic);

        if (!string.IsNullOrEmpty(difficulty))
            query = query.Where(q => q.Difficulty == difficulty);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(q => q.Status == status);

        var questions = await query
            .OrderByDescending(q => q.CreatedAt)
            .Select(q => MapToDto(q))
            .ToListAsync();

        return Ok(ApiResponseDto<List<QuestionDto>>.SuccessResponse(questions));
    }

    // GET /api/questions/{id} - get a single question with options
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<QuestionDto>>> GetQuestion(Guid id)
    {
        var question = await _db.Questions
            .Include(q => q.Options.OrderBy(o => o.SortOrder))
            .Include(q => q.Module)
            .Include(q => q.Topic)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (question == null)
            return NotFound(ApiResponseDto<QuestionDto>.ErrorResponse("Question not found"));

        return Ok(ApiResponseDto<QuestionDto>.SuccessResponse(MapToDto(question)));
    }

    // POST /api/questions - create a new question with options
    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<QuestionDto>>> CreateQuestion(CreateQuestionDto dto)
    {
        // check module exists
        var module = await _db.Modules.FindAsync(dto.ModuleId);
        if (module == null)
            return BadRequest(ApiResponseDto<QuestionDto>.ErrorResponse("Module not found"));

        // check at least 2 options
        if (dto.Options.Count < 2)
            return BadRequest(ApiResponseDto<QuestionDto>.ErrorResponse("At least 2 options are required"));

        // generate display ID like "QB-IT2040-001"
        var count = await _db.Questions.CountAsync(q => q.ModuleId == dto.ModuleId);
        var displayId = $"QB-{module.ModuleCode}-{(count + 1):D3}";

        // create question
        var question = new Question
        {
            QuestionDisplayId = displayId,
            Title = dto.Title,
            QuestionText = dto.QuestionText,
            QuestionType = dto.QuestionType,
            Difficulty = dto.Difficulty,
            ModuleId = dto.ModuleId,
            TopicId = dto.TopicId,
            Explanation = dto.Explanation,
            Marks = dto.Marks,
            Status = dto.Status,
        };

        // create options
        for (int i = 0; i < dto.Options.Count; i++)
        {
            var opt = dto.Options[i];
            question.Options.Add(new QuestionOption
            {
                OptionText = opt.OptionText,
                IsCorrect = opt.IsCorrect,
                SortOrder = i,
            });
        }

        _db.Questions.Add(question);
        await _db.SaveChangesAsync();

        // reload with navigation properties for the response
        var created = await _db.Questions
            .Include(q => q.Options.OrderBy(o => o.SortOrder))
            .Include(q => q.Module)
            .Include(q => q.Topic)
            .FirstAsync(q => q.Id == question.Id);

        return CreatedAtAction(nameof(GetQuestion), new { id = question.Id },
            ApiResponseDto<QuestionDto>.SuccessResponse(MapToDto(created), "Question created successfully"));
    }

    // PUT /api/questions/{id} - update a question and its options
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponseDto<QuestionDto>>> UpdateQuestion(Guid id, UpdateQuestionDto dto)
    {
        var question = await _db.Questions
            .Include(q => q.Options)
            .Include(q => q.Module)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (question == null)
            return NotFound(ApiResponseDto<QuestionDto>.ErrorResponse("Question not found"));

        // update fields
        question.Title = dto.Title;
        question.QuestionText = dto.QuestionText;
        question.QuestionType = dto.QuestionType;
        question.Difficulty = dto.Difficulty;
        question.TopicId = dto.TopicId;
        question.Explanation = dto.Explanation;
        question.Marks = dto.Marks;
        question.Status = dto.Status;
        question.UpdatedAt = DateTime.UtcNow;

        // replace all options — remove old ones first, save, then add new ones
        var oldOptions = question.Options.ToList();
        _db.QuestionOptions.RemoveRange(oldOptions);
        question.Options.Clear();
        await _db.SaveChangesAsync();

        // now add the new options
        for (int i = 0; i < dto.Options.Count; i++)
        {
            var opt = dto.Options[i];
            var newOption = new QuestionOption
            {
                QuestionId = question.Id,
                OptionText = opt.OptionText,
                IsCorrect = opt.IsCorrect,
                SortOrder = i,
            };
            _db.QuestionOptions.Add(newOption);
        }

        await _db.SaveChangesAsync();

        // reload for response
        var updated = await _db.Questions
            .Include(q => q.Options.OrderBy(o => o.SortOrder))
            .Include(q => q.Module)
            .Include(q => q.Topic)
            .FirstAsync(q => q.Id == id);

        return Ok(ApiResponseDto<QuestionDto>.SuccessResponse(MapToDto(updated), "Question updated successfully"));
    }

    // DELETE /api/questions/{id} - delete a question
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponseDto<bool>>> DeleteQuestion(Guid id)
    {
        var question = await _db.Questions.FindAsync(id);
        if (question == null)
            return NotFound(ApiResponseDto<bool>.ErrorResponse("Question not found"));

        // check if question is used in any quiz
        var usedInQuiz = await _db.QuizQuestions.AnyAsync(qq => qq.QuestionId == id);
        if (usedInQuiz)
            return BadRequest(ApiResponseDto<bool>.ErrorResponse(
                "Cannot delete this question because it is used in a quiz. Remove it from the quiz first."));

        _db.Questions.Remove(question);
        await _db.SaveChangesAsync();

        return Ok(ApiResponseDto<bool>.SuccessResponse(true, "Question deleted successfully"));
    }

    // helper to map entity to DTO
    private static QuestionDto MapToDto(Question q)
    {
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
            Options = q.Options.Select(o => new QuestionOptionDto
            {
                Id = o.Id,
                OptionText = o.OptionText,
                IsCorrect = o.IsCorrect,
            }).ToList(),
            CorrectOptionId = correctOption?.Id.ToString() ?? "",
            Explanation = q.Explanation,
            Marks = q.Marks,
            Status = q.Status,
            CreatedAt = q.CreatedAt.ToString("yyyy-MM-dd"),
            UpdatedAt = q.UpdatedAt.ToString("yyyy-MM-dd"),
        };
    }
}
