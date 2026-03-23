using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public class StudentProfileConfiguration : IEntityTypeConfiguration<StudentProfile>
{
    public void Configure(EntityTypeBuilder<StudentProfile> builder)
    {
        builder.ToTable("StudentProfiles");

        builder.HasKey(e => e.UserId);

        builder.Property(e => e.StudentId)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Batch)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.DegreeProgram)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasIndex(e => e.StudentId)
            .IsUnique()
            .HasDatabaseName("IX_StudentProfiles_StudentId");

        builder.HasOne(e => e.User)
            .WithOne(u => u.StudentProfile)
            .HasForeignKey<StudentProfile>(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

