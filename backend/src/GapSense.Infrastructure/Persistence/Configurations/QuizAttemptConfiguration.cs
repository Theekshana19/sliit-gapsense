using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public class QuizAttemptConfiguration : IEntityTypeConfiguration<QuizAttempt>
{
    public void Configure(EntityTypeBuilder<QuizAttempt> builder)
    {
        builder.ToTable("QuizAttempts");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TotalScorePercent)
            .IsRequired();

        builder.Property(e => e.TopicScoresJson)
            .IsRequired();

        builder.Property(e => e.SubmittedAtUtc)
            .IsRequired();

        builder.Property(e => e.AttemptNumber)
            .IsRequired();

        builder.HasOne(e => e.Quiz)
            .WithMany(q => q.Attempts)
            .HasForeignKey(e => e.QuizId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => new { e.QuizId, e.UserId, e.AttemptNumber })
            .IsUnique()
            .HasDatabaseName("IX_QuizAttempts_Quiz_User_Attempt");

        builder.HasIndex(e => e.UserId)
            .HasDatabaseName("IX_QuizAttempts_UserId");

        builder.HasIndex(e => e.SubmittedAtUtc)
            .HasDatabaseName("IX_QuizAttempts_SubmittedAtUtc");
    }
}
