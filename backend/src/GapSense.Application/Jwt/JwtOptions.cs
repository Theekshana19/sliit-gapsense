namespace GapSense.Application.Jwt;

public class JwtOptions
{
    public required string Issuer { get; init; }
    public required string Audience { get; init; }
    public required string Secret { get; init; }

    public int ExpiresInMinutes { get; init; } = 60;
    public int RememberMeExpiresInMinutes { get; init; } = 43200; // default 30 days
}

