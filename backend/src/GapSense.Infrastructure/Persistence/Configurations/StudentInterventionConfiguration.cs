using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public class StudentInterventionConfiguration : IEntityTypeConfiguration<StudentIntervention>
{
    public void Configure(EntityTypeBuilder<StudentIntervention> builder)
    {
        builder.ToTable("StudentInterventions");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.StudentUserId)
            .IsRequired();

        builder.Property(e => e.CreatedByUserId)
            .IsRequired();

        builder.Property(e => e.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(e => e.Notes)
            .HasMaxLength(4000)
            .HasColumnType("nvarchar(4000)");

        builder.Property(e => e.Status)
            .IsRequired()
            .HasMaxLength(32);

        builder.Property(e => e.CreatedAtUtc)
            .IsRequired();

        builder.HasIndex(e => e.StudentUserId)
            .HasDatabaseName("IX_StudentInterventions_StudentUserId");

        builder.HasIndex(e => e.Status)
            .HasDatabaseName("IX_StudentInterventions_Status");
    }
}
