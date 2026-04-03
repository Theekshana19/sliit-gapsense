using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class RiskThresholdConfiguration : IEntityTypeConfiguration<RiskThreshold>
{
    public void Configure(EntityTypeBuilder<RiskThreshold> builder)
    {
        builder.ToTable("RiskThresholds");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ModuleCode)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(x => x.Batch)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(x => x.Semester)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(x => x.HighRiskBelowPercent).IsRequired();
        builder.Property(x => x.MediumRiskBelowPercent).IsRequired();

        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt);
        builder.Property(x => x.IsActive).IsRequired();

        builder.HasIndex(x => new { x.ModuleCode, x.Batch, x.Semester })
            .IsUnique();
    }
}

