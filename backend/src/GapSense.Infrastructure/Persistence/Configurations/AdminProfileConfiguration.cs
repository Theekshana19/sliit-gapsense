using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public class AdminProfileConfiguration : IEntityTypeConfiguration<AdminProfile>
{
    public void Configure(EntityTypeBuilder<AdminProfile> builder)
    {
        builder.ToTable("AdminProfiles");

        builder.HasKey(e => e.UserId);

        builder.Property(e => e.AdminCode)
            .IsRequired()
            .HasMaxLength(30);

        builder.HasIndex(e => e.AdminCode)
            .IsUnique()
            .HasDatabaseName("IX_AdminProfiles_AdminCode");

        builder.HasOne(e => e.User)
            .WithOne(u => u.AdminProfile)
            .HasForeignKey<AdminProfile>(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

