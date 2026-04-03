using System.Text.Json;
using GapSense.Application.DTOs;
using GapSense.Application.Pdf;
using GapSense.Application.Services;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Services;

public class ReadinessResultService : IReadinessResultService
{
    private static readonly JsonSerializerOptions TopicJsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly ApplicationDbContext _context;

    public ReadinessResultService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<ReadinessResultResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var rows = await _context.ReadinessResults
            .AsNoTracking()
            .OrderBy(r => r.ModuleCode)
            .ThenBy(r => r.StudentId)
            .ToListAsync(cancellationToken);

        return rows.Select(MapToResponse).ToList();
    }

    public async Task<ReadinessResultResponse?> GetByIdAsync(Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await _context.ReadinessResults
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        return entity is null ? null : MapToResponse(entity);
    }

    public async Task<byte[]?> GeneratePdfExportAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.ReadinessResults
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        if (entity is null) return null;

        return ReadinessResultPdfGenerator.Generate(entity);
    }

    private static ReadinessResultResponse MapToResponse(ReadinessResult entity)
    {
        return new ReadinessResultResponse
        {
            Id = entity.Id,
            StudentName = entity.StudentName,
            StudentId = entity.StudentId,
            ModuleCode = entity.ModuleCode,
            SemesterLabel = entity.SemesterLabel,
            AttemptLabel = entity.AttemptLabel,
            AnalysisDateLabel = entity.AnalysisDateLabel,
            TotalScorePercent = entity.TotalScorePercent,
            RiskLevel = entity.RiskLevel,
            RiskDescription = entity.RiskDescription,
            WeakTopicsCount = entity.WeakTopicsCount,
            WeakTopicsSeverityLabel = entity.WeakTopicsSeverityLabel,
            WeakTopicsHelperText = entity.WeakTopicsHelperText,
            ActionPlanRecommendationCount = entity.ActionPlanRecommendationCount,
            ActionPlanBadgeLabel = entity.ActionPlanBadgeLabel,
            ActionPlanHelperText = entity.ActionPlanHelperText,
            InterpretationMessage = entity.InterpretationMessage,
            TopicPerformance = ParseTopicPerformance(entity.TopicPerformanceJson)
        };
    }

    private static IReadOnlyList<ReadinessTopicPerformanceDto> ParseTopicPerformance(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return Array.Empty<ReadinessTopicPerformanceDto>();

        try
        {
            var items = JsonSerializer.Deserialize<List<TopicJsonRow>>(json, TopicJsonOptions);
            if (items is null || items.Count == 0)
                return Array.Empty<ReadinessTopicPerformanceDto>();

            return SelectValidItems(items);
        }
        catch (JsonException)
        {
            return Array.Empty<ReadinessTopicPerformanceDto>();
        }
    }

    private static List<ReadinessTopicPerformanceDto> SelectValidItems(List<TopicJsonRow> items)
    {
        var list = new List<ReadinessTopicPerformanceDto>();
        foreach (var row in items)
        {
            var name = row.TopicName?.Trim() ?? string.Empty;
            if (name.Length == 0)
                continue;
            list.Add(new ReadinessTopicPerformanceDto
            {
                TopicName = name,
                Percent = Math.Clamp(row.Percent, 0, 100)
            });
        }

        return list;
    }

    private sealed class TopicJsonRow
    {
        public string? TopicName { get; set; }
        public int Percent { get; set; }
    }
}
