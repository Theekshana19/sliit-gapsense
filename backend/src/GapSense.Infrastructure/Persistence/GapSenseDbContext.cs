using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Persistence;

public sealed class GapSenseDbContext : DbContext
{
    public GapSenseDbContext(DbContextOptions<GapSenseDbContext> options) : base(options) { }

    public DbSet<RiskThreshold> RiskThresholds => Set<RiskThreshold>();
    public DbSet<RecommendationRule> RecommendationRules => Set<RecommendationRule>();
    public DbSet<ReadinessResult> ReadinessResults => Set<ReadinessResult>();
    public DbSet<Semester> Semesters => Set<Semester>();
    public DbSet<AcademicModule> AcademicModules => Set<AcademicModule>();
    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<WeakTopicAnalysis> WeakTopicAnalyses => Set<WeakTopicAnalysis>();
    public DbSet<InterventionAssignment> InterventionAssignments => Set<InterventionAssignment>();
    public DbSet<MonitoringNote> MonitoringNotes => Set<MonitoringNote>();
    public DbSet<MeetingOrFollowUp> Meetings => Set<MeetingOrFollowUp>();
    public DbSet<ReferralOrEscalation> Referrals => Set<ReferralOrEscalation>();
    public DbSet<FollowUpTask> FollowUpTasks => Set<FollowUpTask>();
    public DbSet<InterventionPlan> InterventionPlans => Set<InterventionPlan>();
    public DbSet<InterventionReview> InterventionReviews => Set<InterventionReview>();
    public DbSet<ReportExport> ReportExports => Set<ReportExport>();
    public DbSet<LecturerProfile> LecturerProfiles => Set<LecturerProfile>();
    public DbSet<LecturerAcademicSettings> LecturerAcademicSettings => Set<LecturerAcademicSettings>();
    public DbSet<LecturerNotificationSettings> LecturerNotificationSettings => Set<LecturerNotificationSettings>();
    public DbSet<LecturerSecuritySettings> LecturerSecuritySettings => Set<LecturerSecuritySettings>();
    public DbSet<NotificationFeedItem> NotificationFeedItems => Set<NotificationFeedItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(GapSenseDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}

