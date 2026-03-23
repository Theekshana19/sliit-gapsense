using GapSense.Application.Repositories;
using GapSense.Domain.Entities;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Persistence.Repositories;

public class StudentProfileRepository : IStudentProfileRepository
{
    private readonly ApplicationDbContext _context;

    public StudentProfileRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> StudentIdExistsAsync(string studentId, CancellationToken cancellationToken = default)
    {
        return await _context.StudentProfiles
            .AsNoTracking()
            .AnyAsync(p => p.StudentId == studentId, cancellationToken);
    }

    public async Task<StudentProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.StudentProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
    }

    public async Task AddAsync(StudentProfile profile, CancellationToken cancellationToken = default)
    {
        _context.StudentProfiles.Add(profile);
        await Task.CompletedTask;
    }
}

