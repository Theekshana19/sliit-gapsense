using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class InterventionAssignmentConfiguration : IEntityTypeConfiguration<InterventionAssignment>
{
    public void Configure(EntityTypeBuilder<InterventionAssignment> builder)
    {
        builder.ToTable("InterventionAssignments");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.AssignedToName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.AssignedToRole).HasMaxLength(64).IsRequired();
        builder.Property(x => x.InterventionType).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Priority).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Note).HasMaxLength(2000);
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
    }
}
