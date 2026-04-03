using GapSense.Application.DTOs;
using GapSense.Application.Services;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Services;

public class QuizService : IQuizService
{
    private readonly ApplicationDbContext _context;

    public QuizService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<QuizResponse>> GetPublishedAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _context.Quizzes
            .AsNoTracking()
            .Where(q => q.IsPublished)
            .OrderBy(q => q.ModuleCode)
            .ThenBy(q => q.Title)
            .ToListAsync(cancellationToken);

        return rows.Select(Map).ToList();
    }

    public async Task<IReadOnlyList<QuizResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _context.Quizzes
            .AsNoTracking()
            .OrderByDescending(q => q.UpdatedAtUtc)
            .ToListAsync(cancellationToken);

        return rows.Select(Map).ToList();
    }

    public async Task<QuizResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var row = await _context.Quizzes.AsNoTracking().FirstOrDefaultAsync(q => q.Id == id, cancellationToken);
        return row is null ? null : Map(row);
    }

    public async Task<QuizResponse> CreateAsync(CreateQuizRequest request, Guid createdByUserId,
        CancellationToken cancellationToken = default)
    {
        var title = request.Title.Trim();
        var module = request.ModuleCode.Trim();
        if (title.Length == 0)
            throw new ArgumentException("Title is required.", nameof(request));
        if (module.Length == 0)
            throw new ArgumentException("ModuleCode is required.", nameof(request));

        var now = DateTime.UtcNow;
        var entity = new Quiz
        {
            Id = Guid.NewGuid(),
            Title = title,
            ModuleCode = module,
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            IsPublished = request.IsPublished,
            CreatedByUserId = createdByUserId,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        _context.Quizzes.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    private static QuizResponse Map(Quiz q) =>
        new()
        {
            Id = q.Id,
            Title = q.Title,
            ModuleCode = q.ModuleCode,
            Description = q.Description,
            IsPublished = q.IsPublished,
            CreatedByUserId = q.CreatedByUserId,
            CreatedAtUtc = q.CreatedAtUtc,
            UpdatedAtUtc = q.UpdatedAtUtc
        };
}
