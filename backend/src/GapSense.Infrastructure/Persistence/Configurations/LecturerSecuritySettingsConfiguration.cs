using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class LecturerSecuritySettingsConfiguration : IEntityTypeConfiguration<LecturerSecuritySettings>
{
    public void Configure(EntityTypeBuilder<LecturerSecuritySettings> b)
    {
        b.ToTable("LecturerSecuritySettings");
        b.HasKey(x => x.Id);
        b.Property(x => x.PasswordHash).HasMaxLength(500);
        b.HasIndex(x => x.LecturerProfileId).IsUnique();
        b.HasOne(x => x.LecturerProfile)
            .WithOne(x => x.SecuritySettings)
            .HasForeignKey<LecturerSecuritySettings>(x => x.LecturerProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
