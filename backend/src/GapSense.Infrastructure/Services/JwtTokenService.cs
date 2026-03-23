using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GapSense.Application.Jwt;
using GapSense.Application.Services;
using GapSense.Domain.Enums;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace GapSense.Infrastructure.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly JwtOptions _options;

    public JwtTokenService(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public Task<(string Token, DateTime ExpiresAt)> GenerateTokenAsync(
        Guid userId,
        string email,
        string fullName,
        UserRole role,
        bool rememberMe,
        CancellationToken cancellationToken = default)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(
            rememberMe ? _options.RememberMeExpiresInMinutes : _options.ExpiresInMinutes);

        var claims = new List<Claim>
        {
            // Standard JWT claim
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            // App-friendly claims
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Email, email),
            new(ClaimTypes.Name, fullName),
            new(ClaimTypes.Role, role.ToString().ToLowerInvariant())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAt,
            signingCredentials: creds);

        var handler = new JwtSecurityTokenHandler();
        var tokenString = handler.WriteToken(token);

        return Task.FromResult((tokenString, expiresAt));
    }
}

