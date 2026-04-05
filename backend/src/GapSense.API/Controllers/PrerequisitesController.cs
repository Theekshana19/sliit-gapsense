using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GapSense.Infrastructure.Persistence;
using GapSense.Domain.Entities;
using GapSense.Application.DTOs.Common;
using GapSense.Application.DTOs.Curriculum;

namespace GapSense.API.Controllers;

// handles all API requests related to prerequisite mappings between modules
// base route: /api/prerequisites
[ApiController]
[Authorize]
[Route("api/[controller]")]
public class PrerequisitesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public PrerequisitesController(ApplicationDbContext db)
    {
        _db = db;
    }

    // GET /api/prerequisites - get all prerequisites, optionally filtered by module
    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<List<PrerequisiteDto>>>> GetPrerequisites(
        [FromQuery] Guid? moduleId)
    {
        var query = _db.Prerequisites
            .Include(p => p.MainModule)
            .Include(p => p.PrerequisiteModule)
            .AsQueryable();

        // filter by main module if given
        if (moduleId.HasValue)
            query = query.Where(p => p.MainModuleId == moduleId.Value);

        var prerequisites = await query
            .OrderBy(p => p.MainModule.ModuleCode)
            .Select(p => new PrerequisiteDto
            {
                Id = p.Id,
                MainModuleId = p.MainModuleId,
                MainModuleCode = p.MainModule.ModuleCode,
                MainModuleName = p.MainModule.ModuleName,
                PrerequisiteModuleId = p.PrerequisiteModuleId,
                PrerequisiteModuleCode = p.PrerequisiteModule.ModuleCode,
                PrerequisiteModuleName = p.PrerequisiteModule.ModuleName,
                RelationshipType = p.RelationshipType,
                RelevanceWeight = p.RelevanceWeight,
                Notes = p.Notes,
                Status = p.Status,
                CreatedAt = p.CreatedAt.ToString("yyyy-MM-dd"),
            })
            .ToListAsync();

        return Ok(ApiResponseDto<List<PrerequisiteDto>>.SuccessResponse(prerequisites));
    }

    // GET /api/prerequisites/stats/{moduleId} - get prerequisite stats for a module
    [HttpGet("stats/{moduleId}")]
    public async Task<ActionResult<ApiResponseDto<PrerequisiteStatsDto>>> GetStats(Guid moduleId)
    {
        var prereqs = await _db.Prerequisites
            .Where(p => p.MainModuleId == moduleId)
            .ToListAsync();

        var stats = new PrerequisiteStatsDto
        {
            ActivePrerequisites = prereqs.Count,
            MandatoryPaths = prereqs.Count(p => p.RelationshipType == "Mandatory"),
            AvgRelevanceScore = prereqs.Count > 0
                ? (int)prereqs.Average(p => p.RelevanceWeight)
                : 0,
            DepthLevels = 3, // placeholder - would need recursive calculation for real value
        };

        return Ok(ApiResponseDto<PrerequisiteStatsDto>.SuccessResponse(stats));
    }

    // POST /api/prerequisites - create a new prerequisite mapping
    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<PrerequisiteDto>>> CreatePrerequisite(
        CreatePrerequisiteDto dto)
    {
        // can't make a module its own prerequisite
        if (dto.MainModuleId == dto.PrerequisiteModuleId)
            return BadRequest(ApiResponseDto<PrerequisiteDto>.ErrorResponse(
                "A module cannot be its own prerequisite"));

        // check if both modules exist
        var mainModule = await _db.Modules.FindAsync(dto.MainModuleId);
        if (mainModule == null)
            return BadRequest(ApiResponseDto<PrerequisiteDto>.ErrorResponse("Main module not found"));

        var prereqModule = await _db.Modules.FindAsync(dto.PrerequisiteModuleId);
        if (prereqModule == null)
            return BadRequest(ApiResponseDto<PrerequisiteDto>.ErrorResponse("Prerequisite module not found"));

        // check for duplicate mapping
        var duplicate = await _db.Prerequisites.AnyAsync(p =>
            p.MainModuleId == dto.MainModuleId &&
            p.PrerequisiteModuleId == dto.PrerequisiteModuleId);
        if (duplicate)
            return BadRequest(ApiResponseDto<PrerequisiteDto>.ErrorResponse(
                "This prerequisite mapping already exists"));

        // check for circular dependency (A requires B, and B requires A)
        var circular = await _db.Prerequisites.AnyAsync(p =>
            p.MainModuleId == dto.PrerequisiteModuleId &&
            p.PrerequisiteModuleId == dto.MainModuleId);
        if (circular)
            return BadRequest(ApiResponseDto<PrerequisiteDto>.ErrorResponse(
                "Circular dependency detected! The prerequisite module already requires this module."));

        var prerequisite = new Prerequisite
        {
            MainModuleId = dto.MainModuleId,
            PrerequisiteModuleId = dto.PrerequisiteModuleId,
            RelationshipType = dto.RelationshipType,
            RelevanceWeight = dto.RelevanceWeight,
            Notes = dto.Notes,
        };

        _db.Prerequisites.Add(prerequisite);
        await _db.SaveChangesAsync();

        var result = new PrerequisiteDto
        {
            Id = prerequisite.Id,
            MainModuleId = prerequisite.MainModuleId,
            MainModuleCode = mainModule.ModuleCode,
            MainModuleName = mainModule.ModuleName,
            PrerequisiteModuleId = prerequisite.PrerequisiteModuleId,
            PrerequisiteModuleCode = prereqModule.ModuleCode,
            PrerequisiteModuleName = prereqModule.ModuleName,
            RelationshipType = prerequisite.RelationshipType,
            RelevanceWeight = prerequisite.RelevanceWeight,
            Notes = prerequisite.Notes,
            Status = prerequisite.Status,
            CreatedAt = prerequisite.CreatedAt.ToString("yyyy-MM-dd"),
        };

        return CreatedAtAction(nameof(GetPrerequisites), null,
            ApiResponseDto<PrerequisiteDto>.SuccessResponse(result, "Prerequisite created successfully"));
    }

    // DELETE /api/prerequisites/{id} - delete a prerequisite mapping
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponseDto<bool>>> DeletePrerequisite(Guid id)
    {
        var prerequisite = await _db.Prerequisites.FindAsync(id);
        if (prerequisite == null)
            return NotFound(ApiResponseDto<bool>.ErrorResponse("Prerequisite not found"));

        _db.Prerequisites.Remove(prerequisite);
        await _db.SaveChangesAsync();

        return Ok(ApiResponseDto<bool>.SuccessResponse(true, "Prerequisite deleted successfully"));
    }
}
