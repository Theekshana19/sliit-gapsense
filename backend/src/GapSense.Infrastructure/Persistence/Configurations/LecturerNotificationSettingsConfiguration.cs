using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class LecturerNotificationSettingsConfiguration : IEntityTypeConfiguration<LecturerNotificationSettings>
{
    public void Configure(EntityTypeBuilder<LecturerNotificationSettings> builder)
    {
        builder.ToTable("LecturerNotificationSettings");
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.LecturerProfile)
            .WithOne(x => x.NotificationSettings)
            .HasForeignKey<LecturerNotificationSettings>(x => x.LecturerProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.LecturerProfileId).IsUnique();
    }
}
