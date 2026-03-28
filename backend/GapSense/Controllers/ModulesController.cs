using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GapSense.Data;
using GapSense.Models.Entities;
using GapSense.Models.DTOs.Common;
using GapSense.Models.DTOs.Curriculum;

namespace GapSense.Controllers;

// handles all API requests related to academic modules
// base route: /api/modules
[ApiController]
[Route("api/[controller]")]
public class ModulesController : ControllerBase
{
    private readonly AppDbContext _db;

    public ModulesController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/modules - get all modules with optional filters
    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<List<ModuleDto>>>> GetModules(
        [FromQuery] string? search,
        [FromQuery] string? program,
        [FromQuery] string? semester,
        [FromQuery] string? status)
    {
        // start with all modules
        var query = _db.Modules.AsQueryable();

        // apply filters if provided
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(m =>
                m.ModuleName.Contains(search) ||
                m.ModuleCode.Contains(search));
        }

        if (!string.IsNullOrEmpty(program))
            query = query.Where(m => m.Program == program);

        if (!string.IsNullOrEmpty(semester))
            query = query.Where(m => m.Semester == semester);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(m => m.Status == status);

        // get the modules and convert to DTOs
        var modules = await query
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new ModuleDto
            {
                Id = m.Id,
                ModuleCode = m.ModuleCode,
                ModuleName = m.ModuleName,
                Description = m.Description,
                Program = m.Program,
                Semester = m.Semester,
                Credits = m.Credits,
                Status = m.Status,
                TopicCount = m.Topics.Count,
                PrerequisiteCount = m.PrerequisitesAsMain.Count,
                CreatedAt = m.CreatedAt.ToString("yyyy-MM-dd"),
                UpdatedAt = m.UpdatedAt.ToString("yyyy-MM-dd"),
            })
            .ToListAsync();

        return Ok(ApiResponseDto<List<ModuleDto>>.SuccessResponse(modules));
    }

    // GET /api/modules/{id} - get a single module by ID
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<ModuleDto>>> GetModule(Guid id)
    {
        var module = await _db.Modules
            .Include(m => m.Topics)
            .Include(m => m.PrerequisitesAsMain)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (module == null)
            return NotFound(ApiResponseDto<ModuleDto>.ErrorResponse("Module not found"));

        var dto = new ModuleDto
        {
            Id = module.Id,
            ModuleCode = module.ModuleCode,
            ModuleName = module.ModuleName,
            Description = module.Description,
            Program = module.Program,
            Semester = module.Semester,
            Credits = module.Credits,
            Status = module.Status,
            TopicCount = module.Topics.Count,
            PrerequisiteCount = module.PrerequisitesAsMain.Count,
            CreatedAt = module.CreatedAt.ToString("yyyy-MM-dd"),
            UpdatedAt = module.UpdatedAt.ToString("yyyy-MM-dd"),
        };

        return Ok(ApiResponseDto<ModuleDto>.SuccessResponse(dto));
    }

    // GET /api/modules/stats - get module statistics for the dashboard
    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponseDto<ModuleStatsDto>>> GetStats()
    {
        var modules = await _db.Modules.ToListAsync();

        var stats = new ModuleStatsDto
        {
            TotalModules = modules.Count,
            ActiveModules = modules.Count(m => m.Status == "Active"),
            TotalCreditHours = modules.Sum(m => m.Credits),
            NeedsAttention = modules.Count(m => m.Status == "Draft"),
        };

        return Ok(ApiResponseDto<ModuleStatsDto>.SuccessResponse(stats));
    }

    // POST /api/modules - create a new module
    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<ModuleDto>>> CreateModule(CreateModuleDto dto)
    {
        // check if module code already exists
        var exists = await _db.Modules.AnyAsync(m => m.ModuleCode == dto.ModuleCode);
        if (exists)
            return BadRequest(ApiResponseDto<ModuleDto>.ErrorResponse("Module code already exists"));

        // create the new module
        var module = new Module
        {
            ModuleCode = dto.ModuleCode,
            ModuleName = dto.ModuleName,
            Description = dto.Description,
            Program = dto.Program,
            Semester = dto.Semester,
            Credits = dto.Credits,
            Status = dto.Status,
        };

        _db.Modules.Add(module);
        await _db.SaveChangesAsync();

        // return the created module as DTO
        var result = new ModuleDto
        {
            Id = module.Id,
            ModuleCode = module.ModuleCode,
            ModuleName = module.ModuleName,
            Description = module.Description,
            Program = module.Program,
            Semester = module.Semester,
            Credits = module.Credits,
            Status = module.Status,
            TopicCount = 0,
            PrerequisiteCount = 0,
            CreatedAt = module.CreatedAt.ToString("yyyy-MM-dd"),
            UpdatedAt = module.UpdatedAt.ToString("yyyy-MM-dd"),
        };

        return CreatedAtAction(nameof(GetModule), new { id = module.Id },
            ApiResponseDto<ModuleDto>.SuccessResponse(result, "Module created successfully"));
    }

    // PUT /api/modules/{id} - update an existing module
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponseDto<ModuleDto>>> UpdateModule(Guid id, UpdateModuleDto dto)
    {
        var module = await _db.Modules.FindAsync(id);
        if (module == null)
            return NotFound(ApiResponseDto<ModuleDto>.ErrorResponse("Module not found"));

        // check if new module code conflicts with another module
        var codeConflict = await _db.Modules
            .AnyAsync(m => m.ModuleCode == dto.ModuleCode && m.Id != id);
        if (codeConflict)
            return BadRequest(ApiResponseDto<ModuleDto>.ErrorResponse("Module code already used by another module"));

        // update the fields
        module.ModuleCode = dto.ModuleCode;
        module.ModuleName = dto.ModuleName;
        module.Description = dto.Description;
        module.Program = dto.Program;
        module.Semester = dto.Semester;
        module.Credits = dto.Credits;
        module.Status = dto.Status;
        module.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var result = new ModuleDto
        {
            Id = module.Id,
            ModuleCode = module.ModuleCode,
            ModuleName = module.ModuleName,
            Description = module.Description,
            Program = module.Program,
            Semester = module.Semester,
            Credits = module.Credits,
            Status = module.Status,
            CreatedAt = module.CreatedAt.ToString("yyyy-MM-dd"),
            UpdatedAt = module.UpdatedAt.ToString("yyyy-MM-dd"),
        };

        return Ok(ApiResponseDto<ModuleDto>.SuccessResponse(result, "Module updated successfully"));
    }

    // DELETE /api/modules/{id} - delete a module
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponseDto<bool>>> DeleteModule(Guid id)
    {
        var module = await _db.Modules.FindAsync(id);
        if (module == null)
            return NotFound(ApiResponseDto<bool>.ErrorResponse("Module not found"));

        // check if this module is used as a prerequisite somewhere
        var isPrerequisite = await _db.Prerequisites
            .AnyAsync(p => p.MainModuleId == id || p.PrerequisiteModuleId == id);
        if (isPrerequisite)
            return BadRequest(ApiResponseDto<bool>.ErrorResponse(
                "Cannot delete this module because it has prerequisite relationships. Remove prerequisites first."));

        _db.Modules.Remove(module);
        await _db.SaveChangesAsync();

        return Ok(ApiResponseDto<bool>.SuccessResponse(true, "Module deleted successfully"));
    }
}
