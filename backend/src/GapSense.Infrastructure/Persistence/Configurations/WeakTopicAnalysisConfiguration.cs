using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class WeakTopicAnalysisConfiguration : IEntityTypeConfiguration<WeakTopicAnalysis>
{
    public void Configure(EntityTypeBuilder<WeakTopicAnalysis> builder)
    {
        builder.ToTable("WeakTopicAnalyses");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TopicName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Severity).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Notes).HasMaxLength(1000);
    }
}
