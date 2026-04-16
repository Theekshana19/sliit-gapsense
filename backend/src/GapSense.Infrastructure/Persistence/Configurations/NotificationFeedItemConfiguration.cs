using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class NotificationFeedItemConfiguration : IEntityTypeConfiguration<NotificationFeedItem>
{
    public void Configure(EntityTypeBuilder<NotificationFeedItem> builder)
    {
        builder.ToTable("NotificationFeedItems");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Type).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Title).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Message).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.Route).HasMaxLength(256);
        builder.Property(x => x.SourceType).HasMaxLength(64).IsRequired();
        builder.Property(x => x.SourceKey).HasMaxLength(128).IsRequired();
        builder.Property(x => x.ReadAtUtc);

        builder.HasIndex(x => new { x.LecturerProfileId, x.CreatedAt });
        builder.HasIndex(x => new { x.LecturerProfileId, x.ReadAtUtc });
        builder.HasIndex(x => new { x.LecturerProfileId, x.SourceType, x.SourceKey }).IsUnique();

        builder.HasOne(x => x.LecturerProfile)
            .WithMany()
            .HasForeignKey(x => x.LecturerProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
