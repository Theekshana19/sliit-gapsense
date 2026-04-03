using GapSense.Application.DTOs;

namespace GapSense.Application.Services;

public interface IQuizAttemptService
{
    Task<QuizAttemptResponse> SubmitAsync(Guid quizId, Guid userId, SubmitQuizAttemptRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<QuizAttemptResponse>> GetForUserAsync(Guid userId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<QuizAttemptResponse>> GetForQuizAsync(Guid quizId,
        CancellationToken cancellationToken = default);
}
