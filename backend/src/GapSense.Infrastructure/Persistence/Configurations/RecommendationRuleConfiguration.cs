using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class RecommendationRuleConfiguration : IEntityTypeConfiguration<RecommendationRule>
{
    public void Configure(EntityTypeBuilder<RecommendationRule> builder)
    {
        builder.ToTable("RecommendationRules");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.RuleName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.RiskLevel).HasMaxLength(16).IsRequired();
        builder.Property(x => x.ResourceType).HasMaxLength(64).IsRequired();
        builder.Property(x => x.ActionText).HasMaxLength(500).IsRequired();

        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.IsActive).IsRequired();

        builder.HasIndex(x => new { x.RiskLevel, x.ResourceType });
    }
}

