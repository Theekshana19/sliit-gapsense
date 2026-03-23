using GapSense.Application.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Persistence.Repositories;

public class AdminProfileRepository : IAdminProfileRepository
{
    private readonly ApplicationDbContext _context;

    public AdminProfileRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> AdminCodeExistsAsync(string adminCode, CancellationToken cancellationToken = default)
    {
        return await _context.AdminProfiles
            .AsNoTracking()
            .AnyAsync(p => p.AdminCode == adminCode, cancellationToken);
    }

    public async Task<AdminProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.AdminProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
    }

    public async Task AddAsync(AdminProfile profile, CancellationToken cancellationToken = default)
    {
        _context.AdminProfiles.Add(profile);
        await Task.CompletedTask;
    }
}

