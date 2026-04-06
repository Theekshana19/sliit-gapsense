using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class LecturerAcademicSettingsConfiguration : IEntityTypeConfiguration<LecturerAcademicSettings>
{
    public void Configure(EntityTypeBuilder<LecturerAcademicSettings> b)
    {
        b.ToTable("LecturerAcademicSettings");
        b.HasKey(x => x.Id);
        b.Property(x => x.AcademicYear).HasMaxLength(32).IsRequired();
        b.Property(x => x.Semester).HasMaxLength(64).IsRequired();
        b.Property(x => x.DefaultModule).HasMaxLength(500).IsRequired();
        b.Property(x => x.AssignedFaculty).HasMaxLength(500).IsRequired();
        b.HasIndex(x => x.LecturerProfileId).IsUnique();
        b.HasOne(x => x.LecturerProfile)
            .WithOne(x => x.AcademicSettings)
            .HasForeignKey<LecturerAcademicSettings>(x => x.LecturerProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
