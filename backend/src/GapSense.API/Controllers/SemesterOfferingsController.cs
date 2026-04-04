using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GapSense.Infrastructure.Data;
using GapSense.Domain.Entities;
using GapSense.Application.DTOs.Common;
using GapSense.Application.DTOs.Curriculum;

namespace GapSense.API.Controllers;

// handles all API requests related to semester module offerings
// base route: /api/semester-offerings
[ApiController]
[Route("api/semester-offerings")]
public class SemesterOfferingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SemesterOfferingsController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/semester-offerings - get all offerings
    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<List<SemesterOfferingDto>>>> GetOfferings(
        [FromQuery] string? program,
        [FromQuery] string? semester,
        [FromQuery] string? intake)
    {
        var query = _db.SemesterOfferings
            .Include(so => so.Module)
            .AsQueryable();

        // apply filters
        if (!string.IsNullOrEmpty(program))
            query = query.Where(so => so.Program == program);

        if (!string.IsNullOrEmpty(semester))
            query = query.Where(so => so.Semester == semester);

        if (!string.IsNullOrEmpty(intake))
            query = query.Where(so => so.Intake == intake);

        var offerings = await query
            .OrderBy(so => so.Module.ModuleCode)
            .Select(so => new SemesterOfferingDto
            {
                Id = so.Id,
                ModuleId = so.ModuleId,
                ModuleCode = so.Module.ModuleCode,
                ModuleName = so.Module.ModuleName,
                Program = so.Program,
                Intake = so.Intake,
                Semester = so.Semester,
                LecturerName = so.LecturerName,
                LecturerAvatar = so.LecturerAvatar,
                AvatarColor = so.AvatarColor,
                Status = so.Status,
                CreatedAt = so.CreatedAt.ToString("yyyy-MM-dd"),
            })
            .ToListAsync();

        return Ok(ApiResponseDto<List<SemesterOfferingDto>>.SuccessResponse(offerings));
    }

    // GET /api/semester-offerings/stats - get offering stats
    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponseDto<object>>> GetStats()
    {
        var offerings = await _db.SemesterOfferings.ToListAsync();

        var stats = new
        {
            CompletionPercentage = offerings.Count > 0
                ? (int)(offerings.Count(o => o.Status == "Published") * 100.0 / offerings.Count)
                : 0,
            AttentionNeeded = offerings.Count(o => o.Status == "Draft" || o.Status == "Inactive"),
            EfficiencyGrowth = 12, // placeholder
        };

        return Ok(ApiResponseDto<object>.SuccessResponse(stats));
    }

    // POST /api/semester-offerings - create a new offering
    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<SemesterOfferingDto>>> CreateOffering(
        CreateSemesterOfferingDto dto)
    {
        // check if module exists
        var module = await _db.Modules.FindAsync(dto.ModuleId);
        if (module == null)
            return BadRequest(ApiResponseDto<SemesterOfferingDto>.ErrorResponse("Module not found"));

        var offering = new SemesterOffering
        {
            ModuleId = dto.ModuleId,
            Program = dto.Program,
            Intake = dto.Intake,
            Semester = dto.Semester,
            LecturerName = dto.LecturerName,
            LecturerAvatar = dto.LecturerAvatar,
            AvatarColor = dto.AvatarColor,
            Status = dto.Status,
        };

        _db.SemesterOfferings.Add(offering);
        await _db.SaveChangesAsync();

        var result = new SemesterOfferingDto
        {
            Id = offering.Id,
            ModuleId = offering.ModuleId,
            ModuleCode = module.ModuleCode,
            ModuleName = module.ModuleName,
            Program = offering.Program,
            Intake = offering.Intake,
            Semester = offering.Semester,
            LecturerName = offering.LecturerName,
            LecturerAvatar = offering.LecturerAvatar,
            AvatarColor = offering.AvatarColor,
            Status = offering.Status,
            CreatedAt = offering.CreatedAt.ToString("yyyy-MM-dd"),
        };

        return CreatedAtAction(nameof(GetOfferings), null,
            ApiResponseDto<SemesterOfferingDto>.SuccessResponse(result, "Offering created successfully"));
    }

    // PUT /api/semester-offerings/{id} - update an offering
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponseDto<SemesterOfferingDto>>> UpdateOffering(
        Guid id, CreateSemesterOfferingDto dto)
    {
        var offering = await _db.SemesterOfferings.Include(so => so.Module).FirstOrDefaultAsync(so => so.Id == id);
        if (offering == null)
            return NotFound(ApiResponseDto<SemesterOfferingDto>.ErrorResponse("Offering not found"));

        offering.Program = dto.Program;
        offering.Intake = dto.Intake;
        offering.Semester = dto.Semester;
        offering.LecturerName = dto.LecturerName;
        offering.LecturerAvatar = dto.LecturerAvatar;
        offering.AvatarColor = dto.AvatarColor;
        offering.Status = dto.Status;

        await _db.SaveChangesAsync();

        var result = new SemesterOfferingDto
        {
            Id = offering.Id,
            ModuleId = offering.ModuleId,
            ModuleCode = offering.Module.ModuleCode,
            ModuleName = offering.Module.ModuleName,
            Program = offering.Program,
            Intake = offering.Intake,
            Semester = offering.Semester,
            LecturerName = offering.LecturerName,
            LecturerAvatar = offering.LecturerAvatar,
            AvatarColor = offering.AvatarColor,
            Status = offering.Status,
            CreatedAt = offering.CreatedAt.ToString("yyyy-MM-dd"),
        };

        return Ok(ApiResponseDto<SemesterOfferingDto>.SuccessResponse(result, "Offering updated successfully"));
    }

    // DELETE /api/semester-offerings/{id} - delete an offering
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponseDto<bool>>> DeleteOffering(Guid id)
    {
        var offering = await _db.SemesterOfferings.FindAsync(id);
        if (offering == null)
            return NotFound(ApiResponseDto<bool>.ErrorResponse("Offering not found"));

        _db.SemesterOfferings.Remove(offering);
        await _db.SaveChangesAsync();

        return Ok(ApiResponseDto<bool>.SuccessResponse(true, "Offering deleted successfully"));
    }
}
