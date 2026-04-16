using GapSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GapSense.Infrastructure.Persistence.Configurations;

public sealed class ReferralOrEscalationConfiguration : IEntityTypeConfiguration<ReferralOrEscalation>
{
    public void Configure(EntityTypeBuilder<ReferralOrEscalation> builder)
    {
        builder.ToTable("Referrals");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ReferralType).HasMaxLength(64).IsRequired();
        builder.Property(x => x.ReferredTo).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Reason).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
        builder.Property(x => x.CreatedBy).HasMaxLength(200).IsRequired();
    }
}
