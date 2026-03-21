using GapSense.Application.Pdf;
using GapSense.Application.Services;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Services;

public class ReadinessResultService : IReadinessResultService
{
    private readonly ApplicationDbContext _context;

    public ReadinessResultService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<byte[]?> GeneratePdfExportAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.ReadinessResults
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        if (entity is null) return null;

        return ReadinessResultPdfGenerator.Generate(entity);
    }
}
