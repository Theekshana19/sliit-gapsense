using Microsoft.EntityFrameworkCore;
using GapSense.Models.Entities;

namespace GapSense.Data;

// this is the main database context - connects our app to SQL Server
// all team members will add their DbSets here when they merge their branches
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // --- Sewwandi's tables (Curriculum module) ---
    public DbSet<Module> Modules => Set<Module>();
    public DbSet<Topic> Topics => Set<Topic>();
    public DbSet<Prerequisite> Prerequisites => Set<Prerequisite>();
    public DbSet<SemesterOffering> SemesterOfferings => Set<SemesterOffering>();
    public DbSet<ValidationAlert> ValidationAlerts => Set<ValidationAlert>();

    // --- Chamodi's tables will be added here later ---
    // public DbSet<Question> Questions => Set<Question>();
    // public DbSet<Quiz> Quizzes => Set<Quiz>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --- Module table config ---
        // module code must be unique (no two modules can have the same code)
        modelBuilder.Entity<Module>()
            .HasIndex(m => m.ModuleCode)
            .IsUnique();

        // --- Topic table config ---
        // one module has many topics, if module is deleted then delete its topics too
        modelBuilder.Entity<Topic>()
            .HasOne(t => t.Module)
            .WithMany(m => m.Topics)
            .HasForeignKey(t => t.ModuleId)
            .OnDelete(DeleteBehavior.Cascade);

        // --- Prerequisite table config ---
        // prerequisite links two modules together
        // MainModule = the module that requires the prerequisite
        modelBuilder.Entity<Prerequisite>()
            .HasOne(p => p.MainModule)
            .WithMany(m => m.PrerequisitesAsMain)
            .HasForeignKey(p => p.MainModuleId)
            .OnDelete(DeleteBehavior.Restrict); // don't cascade delete - would be dangerous

        // PrerequisiteModule = the module that must be completed first
        modelBuilder.Entity<Prerequisite>()
            .HasOne(p => p.PrerequisiteModule)
            .WithMany(m => m.PrerequisitesAsPrereq)
            .HasForeignKey(p => p.PrerequisiteModuleId)
            .OnDelete(DeleteBehavior.Restrict); // don't cascade delete

        // prevent duplicate prerequisite mappings (same main + same prereq)
        modelBuilder.Entity<Prerequisite>()
            .HasIndex(p => new { p.MainModuleId, p.PrerequisiteModuleId })
            .IsUnique();

        // --- SemesterOffering table config ---
        // one module can have many offerings across different semesters
        modelBuilder.Entity<SemesterOffering>()
            .HasOne(so => so.Module)
            .WithMany(m => m.SemesterOfferings)
            .HasForeignKey(so => so.ModuleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
