using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class MonitoringNoteConfiguration : IEntityTypeConfiguration<MonitoringNote>
{
    public void Configure(EntityTypeBuilder<MonitoringNote> builder)
    {
        builder.ToTable("MonitoringNotes");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.NoteType).HasMaxLength(64).IsRequired();
        builder.Property(x => x.NoteText).HasMaxLength(4000).IsRequired();
        builder.Property(x => x.AddedBy).HasMaxLength(200).IsRequired();
    }
}
