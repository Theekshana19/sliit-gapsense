using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class LecturerNotificationSettingsConfiguration : IEntityTypeConfiguration<LecturerNotificationSettings>
{
    public void Configure(EntityTypeBuilder<LecturerNotificationSettings> b)
    {
        b.ToTable("LecturerNotificationSettings");
        b.HasKey(x => x.Id);
        b.HasIndex(x => x.LecturerProfileId).IsUnique();
        b.HasOne(x => x.LecturerProfile)
            .WithOne(x => x.NotificationSettings)
            .HasForeignKey<LecturerNotificationSettings>(x => x.LecturerProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
