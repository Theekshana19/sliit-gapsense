using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class InAppNotificationConfiguration : IEntityTypeConfiguration<InAppNotification>
{
    public void Configure(EntityTypeBuilder<InAppNotification> b)
    {
        b.ToTable("InAppNotifications");
        b.HasKey(x => x.Id);
        b.Property(x => x.Title).HasMaxLength(200).IsRequired();
        b.Property(x => x.Message).HasMaxLength(2000).IsRequired();
        b.Property(x => x.Type).HasConversion<int>();
        b.HasIndex(x => new { x.LecturerProfileId, x.CreatedAt });
        b.HasIndex(x => new { x.LecturerProfileId, x.IsRead });
        b.HasOne(x => x.LecturerProfile)
            .WithMany(x => x.InAppNotifications)
            .HasForeignKey(x => x.LecturerProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
