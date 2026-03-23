using GapSense.Application.DTOs;

namespace GapSense.Application.Services;

public interface IAuthService
{
    Task<UserProfileResponse> SignupStudentAsync(StudentSignupRequest request, CancellationToken cancellationToken = default);
    Task<UserProfileResponse> SignupLecturerAsync(LecturerSignupRequest request, CancellationToken cancellationToken = default);
    Task<UserProfileResponse> SignupAdminAsync(AdminSignupRequest request, CancellationToken cancellationToken = default);

    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);

    Task<UserProfileResponse> GetMeAsync(Guid userId, CancellationToken cancellationToken = default);
}

