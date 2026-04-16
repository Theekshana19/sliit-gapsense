using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class LecturerSecuritySettingsConfiguration : IEntityTypeConfiguration<LecturerSecuritySettings>
{
    public void Configure(EntityTypeBuilder<LecturerSecuritySettings> builder)
    {
        builder.ToTable("LecturerSecuritySettings");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.PasswordHash).HasMaxLength(128);
        builder.Property(x => x.SessionTimeoutMinutes).IsRequired();

        builder.HasOne(x => x.LecturerProfile)
            .WithOne(x => x.SecuritySettings)
            .HasForeignKey<LecturerSecuritySettings>(x => x.LecturerProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.LecturerProfileId).IsUnique();
    }
}
