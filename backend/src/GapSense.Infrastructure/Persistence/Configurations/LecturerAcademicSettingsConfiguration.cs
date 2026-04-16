using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class LecturerAcademicSettingsConfiguration : IEntityTypeConfiguration<LecturerAcademicSettings>
{
    public void Configure(EntityTypeBuilder<LecturerAcademicSettings> builder)
    {
        builder.ToTable("LecturerAcademicSettings");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Semester).HasMaxLength(64).IsRequired();
        builder.Property(x => x.AcademicYear).HasMaxLength(32).IsRequired();
        builder.Property(x => x.DefaultModule).HasMaxLength(128).IsRequired();
        builder.Property(x => x.AssignedFaculty).HasMaxLength(128).IsRequired();

        builder.HasOne(x => x.LecturerProfile)
            .WithOne(x => x.AcademicSettings)
            .HasForeignKey<LecturerAcademicSettings>(x => x.LecturerProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.LecturerProfileId).IsUnique();
    }
}
