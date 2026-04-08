using GapSense.Application.Services;
using GapSense.Domain.Entities;
using System.Security.Cryptography;
using System.Text;

namespace GapSense.Infrastructure.Services;

public class PasswordHasherService : IPasswordHasherService
{
    // Format: v1|{saltBase64}|{hashBase64}|{iterations}
    private const string Version = "v1";
    private const int SaltSizeBytes = 16;
    private const int HashSizeBytes = 32;
    private const int DefaultIterations = 100_000;

    public Task<string> HashPasswordAsync(User user, string password, CancellationToken cancellationToken = default)
    {
        // Salt must be unique per password.
        var salt = RandomNumberGenerator.GetBytes(SaltSizeBytes);

        var iterations = DefaultIterations;
        using var pbkdf2 = new Rfc2898DeriveBytes(
            password,
            salt,
            iterations,
            HashAlgorithmName.SHA256);

        var hash = pbkdf2.GetBytes(HashSizeBytes);
        var payload =
            $"{Version}|{Convert.ToBase64String(salt)}|{Convert.ToBase64String(hash)}|{iterations}";
        return Task.FromResult(payload);
    }

    public Task<bool> VerifyPasswordAsync(User user, string providedPassword, string storedPasswordHash, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(storedPasswordHash))
            return Task.FromResult(false);

        // Best-effort parse; any format mismatch => invalid.
        var parts = storedPasswordHash.Split('|');
        if (parts.Length != 4 || !string.Equals(parts[0], Version, StringComparison.Ordinal))
            return Task.FromResult(false);

        if (!int.TryParse(parts[3], out var iterations) || iterations <= 0)
            return Task.FromResult(false);

        byte[] salt;
        byte[] expectedHash;
        try
        {
            salt = Convert.FromBase64String(parts[1]);
            expectedHash = Convert.FromBase64String(parts[2]);
        }
        catch
        {
            return Task.FromResult(false);
        }

        using var pbkdf2 = new Rfc2898DeriveBytes(
            providedPassword,
            salt,
            iterations,
            HashAlgorithmName.SHA256);

        var computedHash = pbkdf2.GetBytes(expectedHash.Length);

        // Constant-time comparison to avoid timing attacks.
        var ok = computedHash.Length == expectedHash.Length &&
                 CryptographicOperations.FixedTimeEquals(computedHash, expectedHash);

        return Task.FromResult(ok);
    }
}

