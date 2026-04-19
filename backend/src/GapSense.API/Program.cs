using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using GapSense.Application.Jwt;
using GapSense.Application.Services;
using GapSense.Application.Repositories;
using GapSense.Infrastructure.Persistence.Repositories;
using GapSense.Infrastructure.Persistence;
using GapSense.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

// Helpful when Visual Studio's external console closes on crash — errors still appear here briefly.
Console.WriteLine($"[{DateTime.UtcNow:O}] GapSense.API starting…");

var builder = WebApplication.CreateBuilder(args);

Console.WriteLine($"Content root: {builder.Environment.ContentRootPath}");

// Optional per-machine overrides (gitignored): copy appsettings.Local.json.example → appsettings.Local.json
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

Console.WriteLine($"Environment: {builder.Environment.EnvironmentName}");

builder.Services.Configure<FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = 10 * 1024 * 1024;
});

builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "GapSense API", Version = "v1" });
    // Required so Swashbuckle can generate swagger.json for multipart / IFormFile endpoints
    c.MapType<IFormFile>(() => new OpenApiSchema
    {
        Type = "string",
        Format = "binary",
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT: enter Bearer {your token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
var jwtSecret = builder.Configuration["Jwt:Secret"];

if (string.IsNullOrWhiteSpace(jwtIssuer) || string.IsNullOrWhiteSpace(jwtAudience) || string.IsNullOrWhiteSpace(jwtSecret))
    throw new InvalidOperationException("JWT is not configured. Please set Jwt:Issuer, Jwt:Audience, and Jwt:Secret in appsettings.json.");

if (Encoding.UTF8.GetByteCount(jwtSecret) < 16)
    throw new InvalidOperationException("Jwt:Secret must be at least 16 bytes (128 bits) for HS256.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromMinutes(1)
    };
});

builder.Services.AddAuthorization();

builder.Services.AddScoped<IRiskThresholdService, RiskThresholdService>();
builder.Services.AddScoped<IRecommendationRuleService, RecommendationRuleService>();
builder.Services.AddScoped<IReadinessResultService, GapSense.Infrastructure.Services.ReadinessResultService>();
builder.Services.AddScoped<IQuizService, QuizService>();
builder.Services.AddScoped<IQuizAttemptService, QuizAttemptService>();
builder.Services.AddScoped<IStudentAnalyticsService, StudentAnalyticsService>();
builder.Services.AddScoped<IOptionalModulesService, OptionalModulesService>();
builder.Services.AddScoped<INotificationService, UserNotificationService>();

// Auth module
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IPasswordHasherService, PasswordHasherService>();

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IStudentProfileRepository, StudentProfileRepository>();
builder.Services.AddScoped<ILecturerProfileRepository, LecturerProfileRepository>();
builder.Services.AddScoped<IAdminProfileRepository, AdminProfileRepository>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

var defaultConnection = app.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(defaultConnection))
{
    Console.Error.WriteLine(
        "ERROR: ConnectionStrings:DefaultConnection is empty. Set it in appsettings.Development.json " +
        "or copy appsettings.Local.json.example to appsettings.Local.json (include Initial Catalog=GapSenseDb).");
    throw new InvalidOperationException("Database connection string is not configured.");
}

// Apply pending EF migrations automatically in non-production so local/staging DBs
// stay in sync (e.g. UserNotifications table) and avoid 500s from missing tables.
if (!app.Environment.IsProduction())
{
    Console.WriteLine("Applying EF Core migrations…");
    try
    {
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.Database.Migrate();
        }

        Console.WriteLine("Migrations completed.");
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine("========================================");
        Console.Error.WriteLine("DATABASE MIGRATION FAILED");
        Console.Error.WriteLine(ex);
        Console.Error.WriteLine("========================================");
        Console.Error.WriteLine("Check SQL Server is running, the database exists, and the connection string uses Initial Catalog=…");
        throw;
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// If the dev profile only binds HTTP (e.g. http://localhost:5292), HTTPS redirection can confuse browsers / VS.
var urlsEnv = Environment.GetEnvironmentVariable("ASPNETCORE_URLS") ?? string.Empty;
if (urlsEnv.Contains("https://", StringComparison.OrdinalIgnoreCase))
{
    app.UseHttpsRedirection();
}
app.UseStaticFiles();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Lifetime.ApplicationStarted.Register(() =>
{
    Console.WriteLine("GapSense API is listening. Swagger UI is available in Development at /swagger");
});

app.Run();
