using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public class QuizConfiguration : IEntityTypeConfiguration<Quiz>
{
    public void Configure(EntityTypeBuilder<Quiz> builder)
    {
        builder.ToTable("Quizzes");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(e => e.ModuleCode)
            .IsRequired()
            .HasMaxLength(32);

        builder.Property(e => e.Description)
            .HasMaxLength(2000);

        builder.Property(e => e.IsPublished)
            .IsRequired();

        builder.Property(e => e.CreatedAtUtc)
            .IsRequired();

        builder.Property(e => e.UpdatedAtUtc)
            .IsRequired();

        builder.HasIndex(e => e.ModuleCode)
            .HasDatabaseName("IX_Quizzes_ModuleCode");

        builder.HasIndex(e => e.IsPublished)
            .HasDatabaseName("IX_Quizzes_IsPublished");
    }
}
