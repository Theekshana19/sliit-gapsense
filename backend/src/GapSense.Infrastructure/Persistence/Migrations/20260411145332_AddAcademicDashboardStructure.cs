using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GapSense.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class AddAcademicDashboardStructure : Migration
{
    private static readonly Guid Semester2024S1Id = Guid.Parse("a1000000-0000-4000-8000-000000000001");
    private static readonly Guid Semester2024S2Id = Guid.Parse("a1000000-0000-4000-8000-000000000002");
    private static readonly Guid Semester2025S1Id = Guid.Parse("a1000000-0000-4000-8000-000000000003");

    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Semesters",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                AcademicYear = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                Term = table.Column<int>(type: "int", nullable: false),
                IsCurrent = table.Column<bool>(type: "bit", nullable: false),
                StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                IsActive = table.Column<bool>(type: "bit", nullable: false),
            },
            constraints: table => table.PrimaryKey("PK_Semesters", x => x.Id));

        migrationBuilder.CreateIndex(
            name: "IX_Semesters_AcademicYear_Term",
            table: "Semesters",
            columns: new[] { "AcademicYear", "Term" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Semesters_IsCurrent",
            table: "Semesters",
            column: "IsCurrent");

        // Baseline semesters (IDs must match MonitoringDbSeeder)
        var utc = DateTime.UtcNow.ToString("O");
        migrationBuilder.Sql($@"
INSERT INTO Semesters (Id, Name, AcademicYear, Term, IsCurrent, StartDate, EndDate, CreatedAt, UpdatedAt, IsActive)
VALUES
('{Semester2024S1Id}', N'Semester 1, 2024', N'2024/2025', 1, 0, '2024-08-01', '2025-01-31', '{utc}', NULL, 1),
('{Semester2024S2Id}', N'Semester 2, 2024', N'2024/2025', 2, 0, '2025-02-01', '2025-07-31', '{utc}', NULL, 1),
('{Semester2025S1Id}', N'Semester 1, 2025', N'2025/2026', 1, 1, '2025-08-01', '2026-01-31', '{utc}', NULL, 1);
");

        migrationBuilder.CreateTable(
            name: "AcademicModules",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                ModuleCode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                ModuleName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                SemesterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                IsActive = table.Column<bool>(type: "bit", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AcademicModules", x => x.Id);
                table.ForeignKey(
                    name: "FK_AcademicModules_Semesters_SemesterId",
                    column: x => x.SemesterId,
                    principalTable: "Semesters",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_AcademicModules_SemesterId_ModuleCode",
            table: "AcademicModules",
            columns: new[] { "SemesterId", "ModuleCode" },
            unique: true);

        migrationBuilder.AddColumn<decimal>(
            name: "ReadinessScore",
            table: "StudentProfiles",
            type: "decimal(5,2)",
            precision: 5,
            scale: 2,
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "SemesterId",
            table: "StudentProfiles",
            type: "uniqueidentifier",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "SemesterId",
            table: "ReadinessResults",
            type: "uniqueidentifier",
            nullable: true);

        // Backfill readiness from risk (demo heuristic) then assign current semester
        migrationBuilder.Sql("""
UPDATE StudentProfiles
SET ReadinessScore = ROUND(100 - (RiskScore / 3.0), 2)
WHERE ReadinessScore IS NULL;
""");

        // Legacy rows used free-text Semester (e.g. "Semester 5"); map all to the seeded current term.
        migrationBuilder.Sql($@"
UPDATE StudentProfiles
SET SemesterId = '{Semester2025S1Id}'
WHERE SemesterId IS NULL;
");

        migrationBuilder.AlterColumn<decimal>(
            name: "ReadinessScore",
            table: "StudentProfiles",
            type: "decimal(5,2)",
            precision: 5,
            scale: 2,
            nullable: false,
            defaultValue: 0m);

        migrationBuilder.AlterColumn<Guid>(
            name: "SemesterId",
            table: "StudentProfiles",
            type: "uniqueidentifier",
            nullable: false,
            oldClrType: typeof(Guid),
            oldType: "uniqueidentifier",
            oldNullable: true);

        migrationBuilder.DropColumn(
            name: "Semester",
            table: "StudentProfiles");

        migrationBuilder.CreateIndex(
            name: "IX_StudentProfiles_SemesterId",
            table: "StudentProfiles",
            column: "SemesterId");

        migrationBuilder.CreateIndex(
            name: "IX_ReadinessResults_SemesterId",
            table: "ReadinessResults",
            column: "SemesterId");

        migrationBuilder.AddForeignKey(
            name: "FK_ReadinessResults_Semesters_SemesterId",
            table: "ReadinessResults",
            column: "SemesterId",
            principalTable: "Semesters",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "FK_StudentProfiles_Semesters_SemesterId",
            table: "StudentProfiles",
            column: "SemesterId",
            principalTable: "Semesters",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_ReadinessResults_Semesters_SemesterId",
            table: "ReadinessResults");

        migrationBuilder.DropForeignKey(
            name: "FK_StudentProfiles_Semesters_SemesterId",
            table: "StudentProfiles");

        migrationBuilder.DropTable(
            name: "AcademicModules");

        migrationBuilder.DropTable(
            name: "Semesters");

        migrationBuilder.DropIndex(
            name: "IX_StudentProfiles_SemesterId",
            table: "StudentProfiles");

        migrationBuilder.DropIndex(
            name: "IX_ReadinessResults_SemesterId",
            table: "ReadinessResults");

        migrationBuilder.DropColumn(
            name: "ReadinessScore",
            table: "StudentProfiles");

        migrationBuilder.DropColumn(
            name: "SemesterId",
            table: "StudentProfiles");

        migrationBuilder.DropColumn(
            name: "SemesterId",
            table: "ReadinessResults");

        migrationBuilder.AddColumn<string>(
            name: "Semester",
            table: "StudentProfiles",
            type: "nvarchar(32)",
            maxLength: 32,
            nullable: false,
            defaultValue: "");
    }
}
