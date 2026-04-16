using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class InterventionPlanConfiguration : IEntityTypeConfiguration<InterventionPlan>
{
    public void Configure(EntityTypeBuilder<InterventionPlan> builder)
    {
        builder.ToTable("InterventionPlans");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ModuleCode).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Batch).HasMaxLength(64).IsRequired();
        builder.Property(x => x.RiskGroup).HasMaxLength(16).IsRequired();
        builder.Property(x => x.WeakTopic).HasMaxLength(200).IsRequired();
        builder.Property(x => x.InterventionType).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
        builder.Property(x => x.AssignedLecturer).HasMaxLength(200);
        builder.Property(x => x.Notes).HasMaxLength(2000);
        builder.HasIndex(x => x.ModuleCode);
        builder.HasIndex(x => x.Batch);
        builder.HasIndex(x => x.RiskGroup);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.PlannedDate);
        builder.HasIndex(x => x.CreatedAt);
        builder.HasIndex(x => new { x.IsActive, x.Status });

        builder.HasOne(x => x.StudentProfile)
            .WithMany()
            .HasForeignKey(x => x.StudentProfileId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(x => x.Reviews)
            .WithOne(x => x.InterventionPlan)
            .HasForeignKey(x => x.InterventionPlanId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
