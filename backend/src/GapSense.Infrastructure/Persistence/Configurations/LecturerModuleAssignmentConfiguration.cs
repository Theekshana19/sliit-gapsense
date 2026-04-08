using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public class LecturerModuleAssignmentConfiguration : IEntityTypeConfiguration<LecturerModuleAssignment>
{
    public void Configure(EntityTypeBuilder<LecturerModuleAssignment> builder)
    {
        builder.ToTable("LecturerModuleAssignments");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.LecturerUserId)
            .IsRequired();

        builder.Property(e => e.CourseModuleId)
            .IsRequired();

        builder.Property(e => e.AssignedAtUtc)
            .IsRequired();

        builder.HasIndex(e => new { e.LecturerUserId, e.CourseModuleId })
            .IsUnique()
            .HasDatabaseName("IX_LecturerModuleAssignments_Lecturer_Module");

        builder.HasIndex(e => e.LecturerUserId)
            .HasDatabaseName("IX_LecturerModuleAssignments_LecturerUserId");
    }
}
