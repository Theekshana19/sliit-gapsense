using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class ReadinessResultConfiguration : IEntityTypeConfiguration<ReadinessResult>
{
    public void Configure(EntityTypeBuilder<ReadinessResult> builder)
    {
        builder.ToTable("ReadinessResults");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.StudentId).HasMaxLength(32).IsRequired();
        builder.Property(x => x.ModuleCode).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Batch).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Semester).HasMaxLength(32).IsRequired();
        builder.Property(x => x.ReadinessScore).HasPrecision(5, 2).IsRequired();
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();

        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.IsActive).IsRequired();

        builder.HasIndex(x => x.StudentId);
        builder.HasIndex(x => x.ModuleCode);
        builder.HasIndex(x => new { x.Batch, x.Semester });
    }
}

