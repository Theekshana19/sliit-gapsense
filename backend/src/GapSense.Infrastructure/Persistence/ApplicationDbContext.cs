using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<RiskThreshold> RiskThresholds => Set<RiskThreshold>();

    public DbSet<RecommendationRule> RecommendationRules => Set<RecommendationRule>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
