using GapSense.Application.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Persistence.Repositories;

public class LecturerProfileRepository : ILecturerProfileRepository
{
    private readonly ApplicationDbContext _context;

    public LecturerProfileRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> StaffIdExistsAsync(string staffId, CancellationToken cancellationToken = default)
    {
        return await _context.LecturerProfiles
            .AsNoTracking()
            .AnyAsync(p => p.StaffId == staffId, cancellationToken);
    }

    public async Task<LecturerProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.LecturerProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
    }

    public async Task AddAsync(LecturerProfile profile, CancellationToken cancellationToken = default)
    {
        _context.LecturerProfiles.Add(profile);
        await Task.CompletedTask;
    }
}

