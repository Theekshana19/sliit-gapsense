using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public class UserNotificationConfiguration : IEntityTypeConfiguration<UserNotification>
{
    public void Configure(EntityTypeBuilder<UserNotification> builder)
    {
        builder.ToTable("UserNotifications");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title).IsRequired().HasMaxLength(300);
        builder.Property(e => e.Message).IsRequired().HasMaxLength(2000);
        builder.Property(e => e.Type).IsRequired().HasMaxLength(32);
        builder.Property(e => e.IsRead).IsRequired();
        builder.Property(e => e.CreatedAtUtc).IsRequired();

        builder.HasIndex(e => new { e.UserId, e.CreatedAtUtc })
            .HasDatabaseName("IX_UserNotifications_UserId_CreatedAtUtc");
    }
}
