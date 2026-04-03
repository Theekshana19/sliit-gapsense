using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Persistence;

public sealed class GapSenseDbContext : DbContext
{
    public GapSenseDbContext(DbContextOptions<GapSenseDbContext> options) : base(options) { }

    public DbSet<RiskThreshold> RiskThresholds => Set<RiskThreshold>();
    public DbSet<RecommendationRule> RecommendationRules => Set<RecommendationRule>();
    public DbSet<ReadinessResult> ReadinessResults => Set<ReadinessResult>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(GapSenseDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}

