using Microsoft.EntityFrameworkCore;

namespace GapSense.Data;

// this is the main database context - connects our app to SQL Server
// all team members will add their DbSets here when they merge their branches
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // we will add DbSet properties here in Phase 2 when we create entity models
    // example: public DbSet<Module> Modules => Set<Module>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // we will add table configurations here in Phase 2
        // like unique constraints, foreign keys, default values etc.
    }
}
