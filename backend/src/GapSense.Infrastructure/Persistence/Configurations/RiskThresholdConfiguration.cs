using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public class RiskThresholdConfiguration : IEntityTypeConfiguration<RiskThreshold>
{
    public void Configure(EntityTypeBuilder<RiskThreshold> builder)
    {
        builder.ToTable("RiskThresholds");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.RuleName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.LowRiskMin)
            .IsRequired();

        builder.Property(e => e.MediumRiskMin)
            .IsRequired();

        builder.Property(e => e.MediumRiskMax)
            .IsRequired();

        builder.Property(e => e.HighRiskMax)
            .IsRequired();

        builder.Property(e => e.IsActive)
            .IsRequired();

        builder.Property(e => e.Notes)
            .HasMaxLength(2000);

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.Property(e => e.UpdatedAt)
            .IsRequired();

        builder.HasIndex(e => e.RuleName)
            .IsUnique()
            .HasDatabaseName("IX_RiskThresholds_RuleName");

        builder.HasIndex(e => e.IsActive)
            .HasDatabaseName("IX_RiskThresholds_IsActive");
    }
}
