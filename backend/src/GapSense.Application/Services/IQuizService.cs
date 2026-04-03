using GapSense.Application.DTOs;

namespace GapSense.Application.Services;

public interface IQuizService
{
    Task<IReadOnlyList<QuizResponse>> GetPublishedAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<QuizResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<QuizResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<QuizResponse> CreateAsync(CreateQuizRequest request, Guid createdByUserId,
        CancellationToken cancellationToken = default);
}
