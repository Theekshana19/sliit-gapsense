using GapSense.Application.DTOs;
using GapSense.Application.Repositories;
using GapSense.Application.Services;
using GapSense.Application.Validation;
using GapSense.Domain.Entities;
using GapSense.Domain.Enums;
using GapSense.Infrastructure.Persistence;

namespace GapSense.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IUserRepository _userRepository;
    private readonly IStudentProfileRepository _studentProfileRepository;
    private readonly ILecturerProfileRepository _lecturerProfileRepository;
    private readonly IAdminProfileRepository _adminProfileRepository;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(
        ApplicationDbContext context,
        IUserRepository userRepository,
        IStudentProfileRepository studentProfileRepository,
        ILecturerProfileRepository lecturerProfileRepository,
        IAdminProfileRepository adminProfileRepository,
        IPasswordHasherService passwordHasher,
        IJwtTokenService jwtTokenService)
    {
        _context = context;
        _userRepository = userRepository;
        _studentProfileRepository = studentProfileRepository;
        _lecturerProfileRepository = lecturerProfileRepository;
        _adminProfileRepository = adminProfileRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<UserProfileResponse> SignupStudentAsync(StudentSignupRequest request, CancellationToken cancellationToken = default)
    {
        var errors = AuthValidator.ValidateStudentSignup(request).ToList();
        if (errors.Count > 0)
            throw new ArgumentException(string.Join(" ", errors));

        var fullName = request.FullName.Trim();
        var normalizedEmail = NormalizeEmail(request.Email);
        var studentId = request.StudentId.Trim();
        var batch = request.Batch.Trim();
        var degreeProgram = request.DegreeProgram.Trim();

        if (await _userRepository.EmailExistsAsync(normalizedEmail, cancellationToken))
            throw new InvalidOperationException("This email is already registered.");

        if (await _studentProfileRepository.StudentIdExistsAsync(studentId, cancellationToken))
            throw new InvalidOperationException("This student ID is already registered.");

        var now = DateTime.UtcNow;
        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = fullName,
            Email = normalizedEmail,
            Role = UserRole.Student,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        user.PasswordHash = await _passwordHasher.HashPasswordAsync(user, request.Password, cancellationToken);

        var profile = new StudentProfile
        {
            UserId = user.Id,
            StudentId = studentId,
            Batch = batch,
            DegreeProgram = degreeProgram
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _studentProfileRepository.AddAsync(profile, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        return MapToProfileResponse(user, profile);
    }

    public async Task<UserProfileResponse> SignupLecturerAsync(LecturerSignupRequest request, CancellationToken cancellationToken = default)
    {
        var errors = AuthValidator.ValidateLecturerSignup(request).ToList();
        if (errors.Count > 0)
            throw new ArgumentException(string.Join(" ", errors));

        var fullName = request.FullName.Trim();
        var normalizedEmail = NormalizeEmail(request.Email);
        var staffId = request.StaffId.Trim();
        var department = request.Department.Trim();
        var specialization = request.Specialization.Trim();

        if (await _userRepository.EmailExistsAsync(normalizedEmail, cancellationToken))
            throw new InvalidOperationException("This email is already registered.");

        if (await _lecturerProfileRepository.StaffIdExistsAsync(staffId, cancellationToken))
            throw new InvalidOperationException("This staff ID is already registered.");

        var now = DateTime.UtcNow;
        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = fullName,
            Email = normalizedEmail,
            Role = UserRole.Lecturer,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        user.PasswordHash = await _passwordHasher.HashPasswordAsync(user, request.Password, cancellationToken);

        var profile = new LecturerProfile
        {
            UserId = user.Id,
            StaffId = staffId,
            Department = department,
            Specialization = specialization
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _lecturerProfileRepository.AddAsync(profile, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        return MapToProfileResponse(user, profile);
    }

    public async Task<UserProfileResponse> SignupAdminAsync(AdminSignupRequest request, CancellationToken cancellationToken = default)
    {
        var errors = AuthValidator.ValidateAdminSignup(request).ToList();
        if (errors.Count > 0)
            throw new ArgumentException(string.Join(" ", errors));

        var fullName = request.FullName.Trim();
        var normalizedEmail = NormalizeEmail(request.InstitutionalEmail);
        var adminCode = request.AdminCode.Trim();

        if (await _userRepository.EmailExistsAsync(normalizedEmail, cancellationToken))
            throw new InvalidOperationException("This email is already registered.");

        if (await _adminProfileRepository.AdminCodeExistsAsync(adminCode, cancellationToken))
            throw new InvalidOperationException("This admin code is already registered.");

        var now = DateTime.UtcNow;
        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = fullName,
            Email = normalizedEmail,
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        user.PasswordHash = await _passwordHasher.HashPasswordAsync(user, request.Password, cancellationToken);

        var profile = new AdminProfile
        {
            UserId = user.Id,
            AdminCode = adminCode
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _adminProfileRepository.AddAsync(profile, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        return MapToProfileResponse(user, profile);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var errors = AuthValidator.ValidateLogin(request).ToList();
        if (errors.Count > 0)
            throw new ArgumentException(string.Join(" ", errors));

        var normalizedEmail = NormalizeEmail(request.Email);
        var user = await _userRepository.GetByNormalizedEmailAsync(normalizedEmail, cancellationToken);

        // Don't leak whether email exists.
        if (user is null)
            throw new InvalidOperationException("Invalid email or password.");

        if (!user.IsActive)
            throw new InvalidOperationException("User is inactive.");

        var verified = await _passwordHasher.VerifyPasswordAsync(user, request.Password, user.PasswordHash, cancellationToken);
        if (!verified)
            throw new InvalidOperationException("Invalid email or password.");

        // Load profile data for response.
        var profileUser = await _userRepository.GetByIdAsync(user.Id, cancellationToken);
        var profile = profileUser is null ? null : MapToProfileResponse(profileUser);

        var (token, expiresAt) = await _jwtTokenService.GenerateTokenAsync(
            userId: user.Id,
            email: user.Email,
            fullName: user.FullName,
            role: user.Role,
            rememberMe: request.RememberMe,
            cancellationToken: cancellationToken);

        return new AuthResponse
        {
            Token = token,
            ExpiresAt = expiresAt,
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            Profile = profile
        };
    }

    public async Task<UserProfileResponse> GetMeAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
            throw new InvalidOperationException("User not found.");

        return MapToProfileResponse(user);
    }

    private static string NormalizeEmail(string email) =>
        email.Trim().ToLowerInvariant();

    private static UserProfileResponse MapToProfileResponse(User user) =>
        user.Role switch
        {
            UserRole.Student => new UserProfileResponse
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                StudentId = user.StudentProfile?.StudentId,
                Batch = user.StudentProfile?.Batch,
                DegreeProgram = user.StudentProfile?.DegreeProgram
            },
            UserRole.Lecturer => new UserProfileResponse
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                StaffId = user.LecturerProfile?.StaffId,
                Department = user.LecturerProfile?.Department,
                Specialization = user.LecturerProfile?.Specialization
            },
            UserRole.Admin => new UserProfileResponse
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                AdminCode = user.AdminProfile?.AdminCode
            },
            _ => new UserProfileResponse
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            }
        };

    private static UserProfileResponse MapToProfileResponse(User user, StudentProfile profile) =>
        new UserProfileResponse
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            StudentId = profile.StudentId,
            Batch = profile.Batch,
            DegreeProgram = profile.DegreeProgram
        };

    private static UserProfileResponse MapToProfileResponse(User user, LecturerProfile profile) =>
        new UserProfileResponse
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            StaffId = profile.StaffId,
            Department = profile.Department,
            Specialization = profile.Specialization
        };

    private static UserProfileResponse MapToProfileResponse(User user, AdminProfile profile) =>
        new UserProfileResponse
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            AdminCode = profile.AdminCode
        };
}

