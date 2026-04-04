using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GapSense.Infrastructure.Data;
using GapSense.Domain.Entities;
using GapSense.Application.DTOs.Common;
using GapSense.Application.DTOs.Readiness;

namespace GapSense.API.Controllers;

// handles learning resources that students can access to prepare for quizzes
// base route: /api/resources
[ApiController]
[Route("api/[controller]")]
public class ResourcesController : ControllerBase
{
    private readonly AppDbContext _db;

    public ResourcesController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/resources - get all resources
    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<List<ResourceDto>>>> GetResources()
    {
        var resources = await _db.Resources
            .Include(r => r.Module)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ResourceDto
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                Type = r.Type,
                Url = r.Url,
                Topic = r.Topic,
                Module = r.Module.ModuleName,
                ModuleCode = r.Module.ModuleCode,
                CreatedAt = r.CreatedAt.ToString("yyyy-MM-dd"),
                UpdatedAt = r.UpdatedAt.ToString("yyyy-MM-dd"),
            })
            .ToListAsync();

        return Ok(ApiResponseDto<List<ResourceDto>>.SuccessResponse(resources));
    }

    // POST /api/resources - create a new resource
    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<ResourceDto>>> CreateResource(CreateResourceDto dto)
    {
        var module = await _db.Modules.FindAsync(dto.ModuleId);
        if (module == null)
            return BadRequest(ApiResponseDto<ResourceDto>.ErrorResponse("Module not found"));

        var resource = new Resource
        {
            Title = dto.Title,
            Description = dto.Description,
            Type = dto.Type,
            Url = dto.Url,
            Topic = dto.Topic,
            ModuleId = dto.ModuleId,
        };

        _db.Resources.Add(resource);
        await _db.SaveChangesAsync();

        var result = new ResourceDto
        {
            Id = resource.Id,
            Title = resource.Title,
            Description = resource.Description,
            Type = resource.Type,
            Url = resource.Url,
            Topic = resource.Topic,
            Module = module.ModuleName,
            ModuleCode = module.ModuleCode,
            CreatedAt = resource.CreatedAt.ToString("yyyy-MM-dd"),
            UpdatedAt = resource.UpdatedAt.ToString("yyyy-MM-dd"),
        };

        return CreatedAtAction(nameof(GetResources), null,
            ApiResponseDto<ResourceDto>.SuccessResponse(result, "Resource created successfully"));
    }

    // PUT /api/resources/{id} - update a resource
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponseDto<ResourceDto>>> UpdateResource(Guid id, CreateResourceDto dto)
    {
        var resource = await _db.Resources.Include(r => r.Module).FirstOrDefaultAsync(r => r.Id == id);
        if (resource == null)
            return NotFound(ApiResponseDto<ResourceDto>.ErrorResponse("Resource not found"));

        var module = await _db.Modules.FindAsync(dto.ModuleId);
        if (module == null)
            return BadRequest(ApiResponseDto<ResourceDto>.ErrorResponse("Module not found"));

        resource.Title = dto.Title;
        resource.Description = dto.Description;
        resource.Type = dto.Type;
        resource.Url = dto.Url;
        resource.Topic = dto.Topic;
        resource.ModuleId = dto.ModuleId;
        resource.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var result = new ResourceDto
        {
            Id = resource.Id,
            Title = resource.Title,
            Description = resource.Description,
            Type = resource.Type,
            Url = resource.Url,
            Topic = resource.Topic,
            Module = module.ModuleName,
            ModuleCode = module.ModuleCode,
            CreatedAt = resource.CreatedAt.ToString("yyyy-MM-dd"),
            UpdatedAt = resource.UpdatedAt.ToString("yyyy-MM-dd"),
        };

        return Ok(ApiResponseDto<ResourceDto>.SuccessResponse(result, "Resource updated successfully"));
    }

    // DELETE /api/resources/{id} - delete a resource
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponseDto<bool>>> DeleteResource(Guid id)
    {
        var resource = await _db.Resources.FindAsync(id);
        if (resource == null)
            return NotFound(ApiResponseDto<bool>.ErrorResponse("Resource not found"));

        _db.Resources.Remove(resource);
        await _db.SaveChangesAsync();

        return Ok(ApiResponseDto<bool>.SuccessResponse(true, "Resource deleted successfully"));
    }
}
