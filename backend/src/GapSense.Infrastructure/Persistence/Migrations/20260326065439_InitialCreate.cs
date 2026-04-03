using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GapSense.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RiskThresholds",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ModuleCode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Batch = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Semester = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    HighRiskBelowPercent = table.Column<int>(type: "int", nullable: false),
                    MediumRiskBelowPercent = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RiskThresholds", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RiskThresholds_ModuleCode_Batch_Semester",
                table: "RiskThresholds",
                columns: new[] { "ModuleCode", "Batch", "Semester" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RiskThresholds");
        }
    }
}
