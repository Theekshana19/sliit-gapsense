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

    public DbSet<ReadinessResult> ReadinessResults => Set<ReadinessResult>();

    public DbSet<User> Users => Set<User>();

    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();

    public DbSet<LecturerProfile> LecturerProfiles => Set<LecturerProfile>();

    public DbSet<AdminProfile> AdminProfiles => Set<AdminProfile>();

    public DbSet<Quiz> Quizzes => Set<Quiz>();

    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();

    public DbSet<CourseModule> CourseModules => Set<CourseModule>();

    public DbSet<LecturerModuleAssignment> LecturerModuleAssignments => Set<LecturerModuleAssignment>();

    public DbSet<StudentIntervention> StudentInterventions => Set<StudentIntervention>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
