using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Persistence;

public sealed class GapSenseDbContext : DbContext
{
    public GapSenseDbContext(DbContextOptions<GapSenseDbContext> options) : base(options) { }

    public DbSet<RiskThreshold> RiskThresholds => Set<RiskThreshold>();
    public DbSet<RecommendationRule> RecommendationRules => Set<RecommendationRule>();
    public DbSet<ReadinessResult> ReadinessResults => Set<ReadinessResult>();
    public DbSet<LecturerProfile> LecturerProfiles => Set<LecturerProfile>();
    public DbSet<LecturerAcademicSettings> LecturerAcademicSettings => Set<LecturerAcademicSettings>();
    public DbSet<LecturerNotificationSettings> LecturerNotificationSettings => Set<LecturerNotificationSettings>();
    public DbSet<LecturerSecuritySettings> LecturerSecuritySettings => Set<LecturerSecuritySettings>();
    public DbSet<InAppNotification> InAppNotifications => Set<InAppNotification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(GapSenseDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}

