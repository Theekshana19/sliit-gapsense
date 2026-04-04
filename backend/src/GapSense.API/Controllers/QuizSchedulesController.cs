using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GapSense.Infrastructure.Data;
using GapSense.Domain.Entities;
using GapSense.Application.DTOs.Common;
using GapSense.Application.DTOs.Readiness;

namespace GapSense.API.Controllers;

// handles quiz scheduling - when quizzes are available for students
// base route: /api/quiz-schedules
[ApiController]
[Route("api/quiz-schedules")]
public class QuizSchedulesController : ControllerBase
{
    private readonly AppDbContext _db;

    public QuizSchedulesController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/quiz-schedules - get all schedules
    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<List<QuizScheduleDto>>>> GetSchedules()
    {
        var schedules = await _db.QuizSchedules
            .Include(qs => qs.Quiz)
                .ThenInclude(q => q.Module)
            .Include(qs => qs.Quiz)
                .ThenInclude(q => q.QuizQuestions)
            .OrderByDescending(qs => qs.CreatedAt)
            .Select(qs => new QuizScheduleDto
            {
                Id = qs.Id,
                QuizId = qs.QuizId.ToString(),
                QuizTitle = qs.Quiz.Title,
                ModuleCode = qs.Quiz.Module.ModuleCode,
                StartDate = qs.StartDate.ToString("yyyy-MM-dd"),
                EndDate = qs.EndDate.ToString("yyyy-MM-dd"),
                MaxAttempts = qs.MaxAttempts,
                ResultVisibility = qs.ResultVisibility,
                Status = qs.Status,
                QuestionCount = qs.Quiz.QuizQuestions.Count,
                QuestionType = "MCQ",
            })
            .ToListAsync();

        return Ok(ApiResponseDto<List<QuizScheduleDto>>.SuccessResponse(schedules));
    }

    // POST /api/quiz-schedules - create a new schedule
    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<QuizScheduleDto>>> CreateSchedule(CreateQuizScheduleDto dto)
    {
        // check quiz exists
        var quiz = await _db.Quizzes
            .Include(q => q.Module)
            .Include(q => q.QuizQuestions)
            .FirstOrDefaultAsync(q => q.Id == dto.QuizId);

        if (quiz == null)
            return BadRequest(ApiResponseDto<QuizScheduleDto>.ErrorResponse("Quiz not found"));

        // end date must be after start date
        if (dto.EndDate <= dto.StartDate)
            return BadRequest(ApiResponseDto<QuizScheduleDto>.ErrorResponse("End date must be after start date"));

        var schedule = new QuizSchedule
        {
            QuizId = dto.QuizId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            MaxAttempts = dto.MaxAttempts,
            ResultVisibility = dto.ResultVisibility,
            Status = dto.Status,
        };

        _db.QuizSchedules.Add(schedule);
        await _db.SaveChangesAsync();

        var result = new QuizScheduleDto
        {
            Id = schedule.Id,
            QuizId = schedule.QuizId.ToString(),
            QuizTitle = quiz.Title,
            ModuleCode = quiz.Module.ModuleCode,
            StartDate = schedule.StartDate.ToString("yyyy-MM-dd"),
            EndDate = schedule.EndDate.ToString("yyyy-MM-dd"),
            MaxAttempts = schedule.MaxAttempts,
            ResultVisibility = schedule.ResultVisibility,
            Status = schedule.Status,
            QuestionCount = quiz.QuizQuestions.Count,
            QuestionType = "MCQ",
        };

        return CreatedAtAction(nameof(GetSchedules), null,
            ApiResponseDto<QuizScheduleDto>.SuccessResponse(result, "Schedule created successfully"));
    }

    // PUT /api/quiz-schedules/{id} - update a schedule
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponseDto<QuizScheduleDto>>> UpdateSchedule(Guid id, UpdateQuizScheduleDto dto)
    {
        var schedule = await _db.QuizSchedules
            .Include(qs => qs.Quiz)
                .ThenInclude(q => q.Module)
            .Include(qs => qs.Quiz)
                .ThenInclude(q => q.QuizQuestions)
            .FirstOrDefaultAsync(qs => qs.Id == id);

        if (schedule == null)
            return NotFound(ApiResponseDto<QuizScheduleDto>.ErrorResponse("Schedule not found"));

        if (dto.EndDate <= dto.StartDate)
            return BadRequest(ApiResponseDto<QuizScheduleDto>.ErrorResponse("End date must be after start date"));

        schedule.StartDate = dto.StartDate;
        schedule.EndDate = dto.EndDate;
        schedule.MaxAttempts = dto.MaxAttempts;
        schedule.ResultVisibility = dto.ResultVisibility;
        schedule.Status = dto.Status;

        await _db.SaveChangesAsync();

        var result = new QuizScheduleDto
        {
            Id = schedule.Id,
            QuizId = schedule.QuizId.ToString(),
            QuizTitle = schedule.Quiz.Title,
            ModuleCode = schedule.Quiz.Module.ModuleCode,
            StartDate = schedule.StartDate.ToString("yyyy-MM-dd"),
            EndDate = schedule.EndDate.ToString("yyyy-MM-dd"),
            MaxAttempts = schedule.MaxAttempts,
            ResultVisibility = schedule.ResultVisibility,
            Status = schedule.Status,
            QuestionCount = schedule.Quiz.QuizQuestions.Count,
            QuestionType = "MCQ",
        };

        return Ok(ApiResponseDto<QuizScheduleDto>.SuccessResponse(result, "Schedule updated successfully"));
    }

    // DELETE /api/quiz-schedules/{id} - delete a schedule
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponseDto<bool>>> DeleteSchedule(Guid id)
    {
        var schedule = await _db.QuizSchedules.FindAsync(id);
        if (schedule == null)
            return NotFound(ApiResponseDto<bool>.ErrorResponse("Schedule not found"));

        _db.QuizSchedules.Remove(schedule);
        await _db.SaveChangesAsync();

        return Ok(ApiResponseDto<bool>.SuccessResponse(true, "Schedule deleted successfully"));
    }
}
