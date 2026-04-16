using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class AcademicModuleConfiguration : IEntityTypeConfiguration<AcademicModule>
{
    public void Configure(EntityTypeBuilder<AcademicModule> builder)
    {
        builder.ToTable("AcademicModules");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ModuleCode).HasMaxLength(32).IsRequired();
        builder.Property(x => x.ModuleName).HasMaxLength(200).IsRequired();
        builder.HasIndex(x => new { x.SemesterId, x.ModuleCode }).IsUnique();
        builder.HasOne(x => x.Semester)
            .WithMany(x => x.Modules)
            .HasForeignKey(x => x.SemesterId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
