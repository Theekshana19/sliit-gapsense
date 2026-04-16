using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class MeetingOrFollowUpConfiguration : IEntityTypeConfiguration<MeetingOrFollowUp>
{
    public void Configure(EntityTypeBuilder<MeetingOrFollowUp> builder)
    {
        builder.ToTable("Meetings");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(2000);
        builder.Property(x => x.MeetingType).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
        builder.Property(x => x.CreatedBy).HasMaxLength(200).IsRequired();
    }
}
