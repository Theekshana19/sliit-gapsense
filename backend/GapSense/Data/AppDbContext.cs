using Microsoft.EntityFrameworkCore;
using GapSense.Models.Entities;

namespace GapSense.Data;

// this is the main database context - connects our app to SQL Server
// all team members add their DbSets here
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // --- Sewwandi's tables (Curriculum module) ---
    public DbSet<Module> Modules => Set<Module>();
    public DbSet<Topic> Topics => Set<Topic>();
    public DbSet<Prerequisite> Prerequisites => Set<Prerequisite>();
    public DbSet<SemesterOffering> SemesterOfferings => Set<SemesterOffering>();
    public DbSet<ValidationAlert> ValidationAlerts => Set<ValidationAlert>();

    // --- Chamodi's tables (Readiness module) ---
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
        base.OnModelCreating(modelBuilder);

        // ============================
        // SEWWANDI'S TABLE CONFIGS
        // ============================

        // module code must be unique
        modelBuilder.Entity<Module>()
            .HasIndex(m => m.ModuleCode)
            .IsUnique();

        // topic belongs to module (cascade delete)
        modelBuilder.Entity<Topic>()
            .HasOne(t => t.Module)
            .WithMany(m => m.Topics)
            .HasForeignKey(t => t.ModuleId)
            .OnDelete(DeleteBehavior.Cascade);

        // prerequisite links two modules (restrict delete for safety)
        modelBuilder.Entity<Prerequisite>()
            .HasOne(p => p.MainModule)
            .WithMany(m => m.PrerequisitesAsMain)
            .HasForeignKey(p => p.MainModuleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Prerequisite>()
            .HasOne(p => p.PrerequisiteModule)
            .WithMany(m => m.PrerequisitesAsPrereq)
            .HasForeignKey(p => p.PrerequisiteModuleId)
            .OnDelete(DeleteBehavior.Restrict);

        // no duplicate prerequisite mappings
        modelBuilder.Entity<Prerequisite>()
            .HasIndex(p => new { p.MainModuleId, p.PrerequisiteModuleId })
            .IsUnique();

        // semester offering belongs to module (cascade delete)
        modelBuilder.Entity<SemesterOffering>()
            .HasOne(so => so.Module)
            .WithMany(m => m.SemesterOfferings)
            .HasForeignKey(so => so.ModuleId)
            .OnDelete(DeleteBehavior.Cascade);

        // ============================
        // CHAMODI'S TABLE CONFIGS
        // ============================

        // question display ID must be unique (like "QB-IT2040-001")
        modelBuilder.Entity<Question>()
            .HasIndex(q => q.QuestionDisplayId)
            .IsUnique();

        // question belongs to a module (restrict delete)
        modelBuilder.Entity<Question>()
            .HasOne(q => q.Module)
            .WithMany()
            .HasForeignKey(q => q.ModuleId)
            .OnDelete(DeleteBehavior.Restrict);

        // question optionally belongs to a topic (set null if topic deleted)
        modelBuilder.Entity<Question>()
            .HasOne(q => q.Topic)
            .WithMany()
            .HasForeignKey(q => q.TopicId)
            .OnDelete(DeleteBehavior.SetNull);

        // question options cascade delete with question
        modelBuilder.Entity<QuestionOption>()
            .HasOne(o => o.Question)
            .WithMany(q => q.Options)
            .HasForeignKey(o => o.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        // quiz belongs to a module (restrict delete)
        modelBuilder.Entity<Quiz>()
            .HasOne(q => q.Module)
            .WithMany()
            .HasForeignKey(q => q.ModuleId)
            .OnDelete(DeleteBehavior.Restrict);

        // quiz-question junction: quiz side cascades, question side restricts
        modelBuilder.Entity<QuizQuestion>()
            .HasOne(qq => qq.Quiz)
            .WithMany(q => q.QuizQuestions)
            .HasForeignKey(qq => qq.QuizId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<QuizQuestion>()
            .HasOne(qq => qq.Question)
            .WithMany()
            .HasForeignKey(qq => qq.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);

        // no duplicate question in the same quiz
        modelBuilder.Entity<QuizQuestion>()
            .HasIndex(qq => new { qq.QuizId, qq.QuestionId })
            .IsUnique();

        // quiz schedule cascades with quiz
        modelBuilder.Entity<QuizSchedule>()
            .HasOne(qs => qs.Quiz)
            .WithMany(q => q.Schedules)
            .HasForeignKey(qs => qs.QuizId)
            .OnDelete(DeleteBehavior.Cascade);

        // submission keeps history (restrict delete on quiz)
        modelBuilder.Entity<Submission>()
            .HasOne(s => s.Quiz)
            .WithMany(q => q.Submissions)
            .HasForeignKey(s => s.QuizId)
            .OnDelete(DeleteBehavior.Restrict);

        // submission answers cascade with submission
        modelBuilder.Entity<SubmissionAnswer>()
            .HasOne(sa => sa.Submission)
            .WithMany(s => s.Answers)
            .HasForeignKey(sa => sa.SubmissionId)
            .OnDelete(DeleteBehavior.Cascade);

        // submission answer references question (restrict delete)
        modelBuilder.Entity<SubmissionAnswer>()
            .HasOne(sa => sa.Question)
            .WithMany()
            .HasForeignKey(sa => sa.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);

        // resource belongs to a module (restrict delete)
        modelBuilder.Entity<Resource>()
            .HasOne(r => r.Module)
            .WithMany()
            .HasForeignKey(r => r.ModuleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
