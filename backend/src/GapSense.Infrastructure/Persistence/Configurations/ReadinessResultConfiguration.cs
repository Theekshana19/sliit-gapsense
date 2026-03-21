using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public class ReadinessResultConfiguration : IEntityTypeConfiguration<ReadinessResult>
{
    public const string DemoReadinessResultId = "00000000-0000-0000-0000-000000000001";

    public void Configure(EntityTypeBuilder<ReadinessResult> builder)
    {
        builder.ToTable("ReadinessResults");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.StudentName).IsRequired().HasMaxLength(200);
        builder.Property(e => e.StudentId).IsRequired().HasMaxLength(50);
        builder.Property(e => e.ModuleCode).IsRequired().HasMaxLength(32);
        builder.Property(e => e.SemesterLabel).IsRequired().HasMaxLength(200);
        builder.Property(e => e.AttemptLabel).IsRequired().HasMaxLength(20);
        builder.Property(e => e.AnalysisDateLabel).IsRequired().HasMaxLength(100);

        builder.Property(e => e.TotalScorePercent).IsRequired();

        builder.Property(e => e.RiskLevel).IsRequired().HasMaxLength(20);
        builder.Property(e => e.RiskDescription).IsRequired().HasMaxLength(1000);

        builder.Property(e => e.WeakTopicsCount).IsRequired();
        builder.Property(e => e.WeakTopicsSeverityLabel).IsRequired().HasMaxLength(100);
        builder.Property(e => e.WeakTopicsHelperText).IsRequired().HasMaxLength(500);

        builder.Property(e => e.ActionPlanRecommendationCount).IsRequired();
        builder.Property(e => e.ActionPlanBadgeLabel).IsRequired().HasMaxLength(100);
        builder.Property(e => e.ActionPlanHelperText).IsRequired().HasMaxLength(500);

        builder.Property(e => e.InterpretationMessage).IsRequired().HasMaxLength(2000);

        builder.Property(e => e.TopicPerformanceJson).IsRequired();
    }
}
