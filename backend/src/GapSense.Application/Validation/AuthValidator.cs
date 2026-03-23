using System.ComponentModel.DataAnnotations;
using GapSense.Application.DTOs;

namespace GapSense.Application.Validation;

public static class AuthValidator
{
    private const int MinPasswordLength = 8;

    private static readonly EmailAddressAttribute EmailAddress = new();

    public static IEnumerable<string> ValidateLogin(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            yield return "Email is required.";

        if (!IsValidEmail(request.Email))
            yield return "Email is not valid.";

        if (string.IsNullOrWhiteSpace(request.Password))
            yield return "Password is required.";
    }

    public static IEnumerable<string> ValidateStudentSignup(StudentSignupRequest request)
    {
        foreach (var err in ValidateCommonSignup(request.FullName, request.Email, request.Password, request.ConfirmPassword))
            yield return err;

        if (string.IsNullOrWhiteSpace(request.StudentId))
            yield return "Student ID is required.";

        if (string.IsNullOrWhiteSpace(request.Batch))
            yield return "Batch is required.";

        if (string.IsNullOrWhiteSpace(request.DegreeProgram))
            yield return "Degree program is required.";
    }

    public static IEnumerable<string> ValidateLecturerSignup(LecturerSignupRequest request)
    {
        foreach (var err in ValidateCommonSignup(request.FullName, request.Email, request.Password, request.ConfirmPassword))
            yield return err;

        if (string.IsNullOrWhiteSpace(request.StaffId))
            yield return "Staff ID is required.";

        if (string.IsNullOrWhiteSpace(request.Department))
            yield return "Department is required.";

        if (string.IsNullOrWhiteSpace(request.Specialization))
            yield return "Specialization is required.";
    }

    public static IEnumerable<string> ValidateAdminSignup(AdminSignupRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName))
            yield return "Full name is required.";

        if (string.IsNullOrWhiteSpace(request.InstitutionalEmail))
            yield return "Institutional email is required.";

        if (!IsValidEmail(request.InstitutionalEmail))
            yield return "Institutional email is not valid.";

        if (string.IsNullOrWhiteSpace(request.Password))
            yield return "Password is required.";

        if (request.Password.Length < MinPasswordLength)
            yield return $"Password must be at least {MinPasswordLength} characters long.";

        if (!string.Equals(request.Password, request.ConfirmPassword, StringComparison.Ordinal))
            yield return "Passwords do not match.";

        if (string.IsNullOrWhiteSpace(request.AdminCode))
            yield return "Admin code is required.";

        var trimmed = request.AdminCode.Trim();
        if (trimmed.Length is < 4 or > 30)
            yield return "Admin code length must be between 4 and 30 characters.";

        if (trimmed.Any(char.IsWhiteSpace))
            yield return "Admin code must not contain spaces.";
    }

    private static IEnumerable<string> ValidateCommonSignup(string fullName, string email, string password, string confirmPassword)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            yield return "Full name is required.";

        if (string.IsNullOrWhiteSpace(email))
            yield return "Email is required.";

        if (!IsValidEmail(email))
            yield return "Email is not valid.";

        if (string.IsNullOrWhiteSpace(password))
            yield return "Password is required.";

        if (password.Length < MinPasswordLength)
            yield return $"Password must be at least {MinPasswordLength} characters long.";

        if (!string.Equals(password, confirmPassword, StringComparison.Ordinal))
            yield return "Passwords do not match.";
    }

    private static bool IsValidEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        return EmailAddress.IsValid(email);
    }
}

