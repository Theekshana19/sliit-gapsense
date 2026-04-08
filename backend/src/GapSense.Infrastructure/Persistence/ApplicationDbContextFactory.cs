using System.IO;
using System.Text.Json;
using GapSense.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace GapSense.Infrastructure.Persistence;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // EF tooling may run with a different current directory; derive paths from the assembly location.
        var currentDir = Directory.GetCurrentDirectory();
        var inferredInfraDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", ".."));
        var inferredApiDir = Path.GetFullPath(Path.Combine(inferredInfraDir, "..", "GapSense.API"));

        var appSettings = Path.Combine(inferredApiDir, "appsettings.json");
        var devAppSettings = Path.Combine(inferredApiDir, "appsettings.Development.json");

        // Fallback for unusual tooling setups.
        var fallbackApiDir = Path.Combine(currentDir, "backend", "src", "GapSense.API");
        if (!File.Exists(devAppSettings) && Directory.Exists(fallbackApiDir))
            devAppSettings = Path.Combine(fallbackApiDir, "appsettings.Development.json");
        if (!File.Exists(appSettings) && Directory.Exists(fallbackApiDir))
            appSettings = Path.Combine(fallbackApiDir, "appsettings.json");

        var connectionString =
            TryGetDefaultConnectionString(devAppSettings) ??
            TryGetDefaultConnectionString(appSettings);
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

        return new ApplicationDbContext(optionsBuilder.Options);
    }

    private static string? TryGetDefaultConnectionString(string filePath)
    {
        if (!File.Exists(filePath))
            return null;

        using var stream = File.OpenRead(filePath);
        using var doc = JsonDocument.Parse(stream);

        if (doc.RootElement.TryGetProperty("ConnectionStrings", out var cs) &&
            cs.TryGetProperty("DefaultConnection", out var def))
        {
            return def.GetString();
        }

        return null;
    }
}

