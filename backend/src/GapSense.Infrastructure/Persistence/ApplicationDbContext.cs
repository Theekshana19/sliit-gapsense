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

    public DbSet<LegacyQuiz> LegacyQuizzes => Set<LegacyQuiz>();

    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();

    public DbSet<CourseModule> CourseModules => Set<CourseModule>();

    public DbSet<LecturerModuleAssignment> LecturerModuleAssignments => Set<LecturerModuleAssignment>();

    public DbSet<StudentIntervention> StudentInterventions => Set<StudentIntervention>();

    public DbSet<Module> Modules => Set<Module>();

    public DbSet<Topic> Topics => Set<Topic>();

    public DbSet<Prerequisite> Prerequisites => Set<Prerequisite>();

    public DbSet<SemesterOffering> SemesterOfferings => Set<SemesterOffering>();

    public DbSet<ValidationAlert> ValidationAlerts => Set<ValidationAlert>();

    public DbSet<Question> Questions => Set<Question>();

    public DbSet<QuestionOption> QuestionOptions => Set<QuestionOption>();

    public DbSet<Quiz> Quizzes => Set<Quiz>();

    public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();

    public DbSet<QuizSchedule> QuizSchedules => Set<QuizSchedule>();

    public DbSet<Submission> Submissions => Set<Submission>();

    public DbSet<SubmissionAnswer> SubmissionAnswers => Set<SubmissionAnswer>();

    public DbSet<Resource> Resources => Set<Resource>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        CurriculumReadinessModelBuilder.Configure(modelBuilder);
    }
}
