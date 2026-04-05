using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GapSense.Infrastructure.Persistence;

/// <summary>EF configuration for Sewwandi curriculum + Chamodi readiness tables (merged from Sewwandi AppDbContext).</summary>
internal static class CurriculumReadinessModelBuilder
{
    public static void Configure(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Module>()
            .HasIndex(m => m.ModuleCode)
            .IsUnique();

        modelBuilder.Entity<Topic>()
            .HasOne(t => t.Module)
            .WithMany(m => m.Topics)
            .HasForeignKey(t => t.ModuleId)
            .OnDelete(DeleteBehavior.Cascade);

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

        modelBuilder.Entity<Prerequisite>()
            .HasIndex(p => new { p.MainModuleId, p.PrerequisiteModuleId })
            .IsUnique();

        modelBuilder.Entity<SemesterOffering>()
            .HasOne(so => so.Module)
            .WithMany(m => m.SemesterOfferings)
            .HasForeignKey(so => so.ModuleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Question>()
            .HasIndex(q => q.QuestionDisplayId)
            .IsUnique();

        modelBuilder.Entity<Question>()
            .HasOne(q => q.Module)
            .WithMany()
            .HasForeignKey(q => q.ModuleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Question>()
            .HasOne(q => q.Topic)
            .WithMany()
            .HasForeignKey(q => q.TopicId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<QuestionOption>()
            .HasOne(o => o.Question)
            .WithMany(q => q.Options)
            .HasForeignKey(o => o.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Quiz>()
            .ToTable("ReadinessQuizzes")
            .HasOne(q => q.Module)
            .WithMany()
            .HasForeignKey(q => q.ModuleId)
            .OnDelete(DeleteBehavior.Restrict);

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

        modelBuilder.Entity<QuizQuestion>()
            .HasIndex(qq => new { qq.QuizId, qq.QuestionId })
            .IsUnique();

        modelBuilder.Entity<QuizSchedule>()
            .HasOne(qs => qs.Quiz)
            .WithMany(q => q.Schedules)
            .HasForeignKey(qs => qs.QuizId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Submission>()
            .HasOne(s => s.Quiz)
            .WithMany(q => q.Submissions)
            .HasForeignKey(s => s.QuizId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SubmissionAnswer>()
            .HasOne(sa => sa.Submission)
            .WithMany(s => s.Answers)
            .HasForeignKey(sa => sa.SubmissionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SubmissionAnswer>()
            .HasOne(sa => sa.Question)
            .WithMany()
            .HasForeignKey(sa => sa.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Resource>()
            .HasOne(r => r.Module)
            .WithMany()
            .HasForeignKey(r => r.ModuleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
