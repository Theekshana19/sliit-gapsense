using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public class LecturerProfileConfiguration : IEntityTypeConfiguration<LecturerProfile>
{
    public void Configure(EntityTypeBuilder<LecturerProfile> builder)
    {
        builder.ToTable("LecturerProfiles");

        builder.HasKey(e => e.UserId);

        builder.Property(e => e.StaffId)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Department)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Specialization)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasIndex(e => e.StaffId)
            .IsUnique()
            .HasDatabaseName("IX_LecturerProfiles_StaffId");

        builder.HasOne(e => e.User)
            .WithOne(u => u.LecturerProfile)
            .HasForeignKey<LecturerProfile>(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

