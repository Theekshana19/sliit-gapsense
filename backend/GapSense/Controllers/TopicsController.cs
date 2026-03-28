using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GapSense.Data;
using GapSense.Models.Entities;
using GapSense.Models.DTOs.Common;
using GapSense.Models.DTOs.Curriculum;

namespace GapSense.Controllers;

// handles all API requests related to topics within modules
// base route: /api/topics
[ApiController]
[Route("api/[controller]")]
public class TopicsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TopicsController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/topics?moduleId={id} - get topics for a specific module
    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<List<TopicDto>>>> GetTopics([FromQuery] Guid? moduleId)
    {
        var query = _db.Topics.Include(t => t.Module).AsQueryable();

        // if moduleId is given, filter by that module
        if (moduleId.HasValue)
            query = query.Where(t => t.ModuleId == moduleId.Value);

        var topics = await query
            .OrderBy(t => t.TopicName)
            .Select(t => new TopicDto
            {
                Id = t.Id,
                ModuleId = t.ModuleId,
                ModuleCode = t.Module.ModuleCode,
                ModuleName = t.Module.ModuleName,
                TopicName = t.TopicName,
                Description = t.Description,
                Weight = t.Weight,
                ImportanceLevel = t.ImportanceLevel,
                Status = t.Status,
                IsActive = t.IsActive,
                CreatedAt = t.CreatedAt.ToString("yyyy-MM-dd"),
                UpdatedAt = t.UpdatedAt.ToString("yyyy-MM-dd"),
            })
            .ToListAsync();

        return Ok(ApiResponseDto<List<TopicDto>>.SuccessResponse(topics));
    }

    // GET /api/topics/{id} - get a single topic
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<TopicDto>>> GetTopic(Guid id)
    {
        var topic = await _db.Topics
            .Include(t => t.Module)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (topic == null)
            return NotFound(ApiResponseDto<TopicDto>.ErrorResponse("Topic not found"));

        var dto = new TopicDto
        {
            Id = topic.Id,
            ModuleId = topic.ModuleId,
            ModuleCode = topic.Module.ModuleCode,
            ModuleName = topic.Module.ModuleName,
            TopicName = topic.TopicName,
            Description = topic.Description,
            Weight = topic.Weight,
            ImportanceLevel = topic.ImportanceLevel,
            Status = topic.Status,
            IsActive = topic.IsActive,
            CreatedAt = topic.CreatedAt.ToString("yyyy-MM-dd"),
            UpdatedAt = topic.UpdatedAt.ToString("yyyy-MM-dd"),
        };

        return Ok(ApiResponseDto<TopicDto>.SuccessResponse(dto));
    }

    // GET /api/topics/stats/{moduleId} - get topic stats for a module
    [HttpGet("stats/{moduleId}")]
    public async Task<ActionResult<ApiResponseDto<TopicStatsDto>>> GetStats(Guid moduleId)
    {
        var topics = await _db.Topics
            .Where(t => t.ModuleId == moduleId)
            .ToListAsync();

        var stats = new TopicStatsDto
        {
            TotalTopics = topics.Count,
            ValidatedCount = topics.Count(t => t.Status == "Validated"),
            DraftCount = topics.Count(t => t.Status == "Draft"),
            TotalWeight = topics.Sum(t => t.Weight),
            AlignmentPercentage = topics.Count > 0 ? 92 : 0, // placeholder for now
        };

        return Ok(ApiResponseDto<TopicStatsDto>.SuccessResponse(stats));
    }

    // GET /api/topics/weights/{moduleId} - get topic weights for the config page
    [HttpGet("weights/{moduleId}")]
    public async Task<ActionResult<ApiResponseDto<List<TopicWeightUpdateDto>>>> GetWeights(Guid moduleId)
    {
        var weights = await _db.Topics
            .Where(t => t.ModuleId == moduleId)
            .Select(t => new TopicWeightUpdateDto
            {
                Id = t.Id,
                Weight = t.Weight,
            })
            .ToListAsync();

        return Ok(ApiResponseDto<List<TopicWeightUpdateDto>>.SuccessResponse(weights));
    }

    // POST /api/topics - create a new topic
    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<TopicDto>>> CreateTopic(CreateTopicDto dto)
    {
        // check if the module exists
        var module = await _db.Modules.FindAsync(dto.ModuleId);
        if (module == null)
            return BadRequest(ApiResponseDto<TopicDto>.ErrorResponse("Module not found"));

        var topic = new Topic
        {
            ModuleId = dto.ModuleId,
            TopicName = dto.TopicName,
            Description = dto.Description,
            Weight = dto.Weight,
            ImportanceLevel = dto.ImportanceLevel,
            Status = dto.Status,
            IsActive = dto.IsActive,
        };

        _db.Topics.Add(topic);
        await _db.SaveChangesAsync();

        var result = new TopicDto
        {
            Id = topic.Id,
            ModuleId = topic.ModuleId,
            ModuleCode = module.ModuleCode,
            ModuleName = module.ModuleName,
            TopicName = topic.TopicName,
            Description = topic.Description,
            Weight = topic.Weight,
            ImportanceLevel = topic.ImportanceLevel,
            Status = topic.Status,
            IsActive = topic.IsActive,
            CreatedAt = topic.CreatedAt.ToString("yyyy-MM-dd"),
            UpdatedAt = topic.UpdatedAt.ToString("yyyy-MM-dd"),
        };

        return CreatedAtAction(nameof(GetTopic), new { id = topic.Id },
            ApiResponseDto<TopicDto>.SuccessResponse(result, "Topic created successfully"));
    }

    // PUT /api/topics/{id} - update a topic
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponseDto<TopicDto>>> UpdateTopic(Guid id, UpdateTopicDto dto)
    {
        var topic = await _db.Topics.Include(t => t.Module).FirstOrDefaultAsync(t => t.Id == id);
        if (topic == null)
            return NotFound(ApiResponseDto<TopicDto>.ErrorResponse("Topic not found"));

        topic.TopicName = dto.TopicName;
        topic.Description = dto.Description;
        topic.Weight = dto.Weight;
        topic.ImportanceLevel = dto.ImportanceLevel;
        topic.Status = dto.Status;
        topic.IsActive = dto.IsActive;
        topic.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var result = new TopicDto
        {
            Id = topic.Id,
            ModuleId = topic.ModuleId,
            ModuleCode = topic.Module.ModuleCode,
            ModuleName = topic.Module.ModuleName,
            TopicName = topic.TopicName,
            Description = topic.Description,
            Weight = topic.Weight,
            ImportanceLevel = topic.ImportanceLevel,
            Status = topic.Status,
            IsActive = topic.IsActive,
            CreatedAt = topic.CreatedAt.ToString("yyyy-MM-dd"),
            UpdatedAt = topic.UpdatedAt.ToString("yyyy-MM-dd"),
        };

        return Ok(ApiResponseDto<TopicDto>.SuccessResponse(result, "Topic updated successfully"));
    }

    // PUT /api/topics/weights/{moduleId} - batch update topic weights
    [HttpPut("weights/{moduleId}")]
    public async Task<ActionResult<ApiResponseDto<bool>>> UpdateWeights(
        Guid moduleId, List<TopicWeightUpdateDto> weights)
    {
        // check if total equals 100
        var total = weights.Sum(w => w.Weight);
        if (total != 100)
            return BadRequest(ApiResponseDto<bool>.ErrorResponse(
                $"Total weight must be exactly 100%. Current total: {total}%"));

        // update each topic's weight
        foreach (var w in weights)
        {
            var topic = await _db.Topics.FindAsync(w.Id);
            if (topic != null && topic.ModuleId == moduleId)
            {
                topic.Weight = w.Weight;
                topic.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _db.SaveChangesAsync();

        return Ok(ApiResponseDto<bool>.SuccessResponse(true, "Topic weights updated successfully"));
    }

    // DELETE /api/topics/{id} - delete a topic
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponseDto<bool>>> DeleteTopic(Guid id)
    {
        var topic = await _db.Topics.FindAsync(id);
        if (topic == null)
            return NotFound(ApiResponseDto<bool>.ErrorResponse("Topic not found"));

        _db.Topics.Remove(topic);
        await _db.SaveChangesAsync();

        return Ok(ApiResponseDto<bool>.SuccessResponse(true, "Topic deleted successfully"));
    }
}
