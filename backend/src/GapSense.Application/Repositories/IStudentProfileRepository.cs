using GapSense.Domain.Entities;

namespace GapSense.Application.Repositories;

public interface IStudentProfileRepository
{
    Task<bool> StudentIdExistsAsync(string studentId, CancellationToken cancellationToken = default);
    Task<StudentProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(StudentProfile profile, CancellationToken cancellationToken = default);
}

