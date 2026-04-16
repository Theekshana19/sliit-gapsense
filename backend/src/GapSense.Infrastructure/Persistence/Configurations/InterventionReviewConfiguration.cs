using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class InterventionReviewConfiguration : IEntityTypeConfiguration<InterventionReview>
{
    public void Configure(EntityTypeBuilder<InterventionReview> builder)
    {
        builder.ToTable("InterventionReviews");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Outcome).HasMaxLength(32).IsRequired();
        builder.Property(x => x.ImprovementPercentage).HasPrecision(5, 2);
        builder.HasIndex(x => x.InterventionPlanId);
        builder.HasIndex(x => x.IsCompleted);
    }
}
