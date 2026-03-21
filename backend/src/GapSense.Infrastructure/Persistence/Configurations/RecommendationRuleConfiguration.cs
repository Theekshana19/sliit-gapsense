using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public class RecommendationRuleConfiguration : IEntityTypeConfiguration<RecommendationRule>
{
    public void Configure(EntityTypeBuilder<RecommendationRule> builder)
    {
        builder.ToTable("RecommendationRules");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.RuleName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.ModuleCode)
            .IsRequired()
            .HasMaxLength(32);

        builder.Property(e => e.ModuleName)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(e => e.TopicName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.ConditionType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(e => e.ScoreThreshold)
            .IsRequired();

        builder.Property(e => e.RecommendationTitle)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.ResourceType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.PriorityLevel)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(e => e.ResourceUrl)
            .HasMaxLength(2000);

        builder.Property(e => e.AttachmentPath)
            .HasMaxLength(500);

        builder.Property(e => e.AdministrativeRationale)
            .HasMaxLength(4000);

        builder.Property(e => e.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.Property(e => e.UpdatedAt)
            .IsRequired();

        builder.HasIndex(e => new { e.ModuleCode, e.TopicName, e.ConditionType, e.ScoreThreshold })
            .IsUnique()
            .HasDatabaseName("IX_RecommendationRules_Module_Topic_Condition_Score");

        builder.HasIndex(e => e.ModuleCode)
            .HasDatabaseName("IX_RecommendationRules_ModuleCode");

        builder.HasIndex(e => e.Status)
            .HasDatabaseName("IX_RecommendationRules_Status");
    }
}
