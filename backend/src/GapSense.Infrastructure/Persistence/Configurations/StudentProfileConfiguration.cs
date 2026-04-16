using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class StudentProfileConfiguration : IEntityTypeConfiguration<StudentProfile>
{
    public void Configure(EntityTypeBuilder<StudentProfile> builder)
    {
        builder.ToTable("StudentProfiles");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => x.StudentId).IsUnique();
        builder.Property(x => x.StudentId).HasMaxLength(32).IsRequired();
        builder.Property(x => x.FullName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(256).IsRequired();
        builder.Property(x => x.Phone).HasMaxLength(32);
        builder.Property(x => x.Batch).HasMaxLength(64).IsRequired();
        builder.Property(x => x.DegreeProgram).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Gpa).HasPrecision(4, 2);
        builder.Property(x => x.AttendancePercentage).HasPrecision(5, 2);
        builder.Property(x => x.RecentAssessmentScore).HasPrecision(5, 2);
        builder.Property(x => x.ReadinessScore).HasPrecision(5, 2).IsRequired();
        builder.Property(x => x.RiskScore).HasPrecision(5, 2);
        builder.Property(x => x.RiskLevel).HasMaxLength(32).IsRequired();
        builder.Property(x => x.PerformanceTrend).HasMaxLength(64).IsRequired();
        builder.Property(x => x.CurrentModule).HasMaxLength(200).IsRequired();

        builder.HasOne(x => x.EnrolledSemester)
            .WithMany(x => x.StudentProfiles)
            .HasForeignKey(x => x.SemesterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.SemesterId, x.Batch });
        builder.HasIndex(x => x.CurrentModule);
        builder.HasIndex(x => x.RiskLevel);

        builder.HasMany(x => x.WeakTopics)
            .WithOne(x => x.StudentProfile)
            .HasForeignKey(x => x.StudentProfileId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(x => x.InterventionAssignments)
            .WithOne(x => x.StudentProfile)
            .HasForeignKey(x => x.StudentProfileId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(x => x.MonitoringNotes)
            .WithOne(x => x.StudentProfile)
            .HasForeignKey(x => x.StudentProfileId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(x => x.Meetings)
            .WithOne(x => x.StudentProfile)
            .HasForeignKey(x => x.StudentProfileId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(x => x.Referrals)
            .WithOne(x => x.StudentProfile)
            .HasForeignKey(x => x.StudentProfileId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(x => x.FollowUpTasks)
            .WithOne(x => x.StudentProfile)
            .HasForeignKey(x => x.StudentProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
