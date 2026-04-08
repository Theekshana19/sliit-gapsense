using GapSense.Domain.Enums;

namespace GapSense.Domain.Entities;

public class User
{
    public Guid Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    // Store normalized (trimmed + lower) email for uniqueness and login.
    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string? ProfileImagePath { get; set; }

    public StudentProfile? StudentProfile { get; set; }
    public LecturerProfile? LecturerProfile { get; set; }
    public AdminProfile? AdminProfile { get; set; }
}

