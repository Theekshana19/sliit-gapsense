using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class ReportExportConfiguration : IEntityTypeConfiguration<ReportExport>
{
    public void Configure(EntityTypeBuilder<ReportExport> builder)
    {
        builder.ToTable("ReportExports");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ReportType).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Format).HasMaxLength(16).IsRequired();
        builder.Property(x => x.FileName).HasMaxLength(260).IsRequired();
        builder.Property(x => x.ContentType).HasMaxLength(128).IsRequired();
        builder.Property(x => x.FileContent).IsRequired();
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Batch).HasMaxLength(64).IsRequired();
        builder.Property(x => x.ModuleCode).HasMaxLength(64);
        builder.Property(x => x.SemesterName).HasMaxLength(128).IsRequired();
        builder.Property(x => x.GeneratedBy).HasMaxLength(128).IsRequired();

        builder.HasIndex(x => x.CreatedAt);
        builder.HasIndex(x => x.ReportType);
        builder.HasIndex(x => x.Format);
        builder.HasIndex(x => x.SemesterId);
    }
}
