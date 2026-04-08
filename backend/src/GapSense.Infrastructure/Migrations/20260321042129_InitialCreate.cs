using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GapSense.Infrastructure.Migrations
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
                    RuleName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LowRiskMin = table.Column<int>(type: "int", nullable: false),
                    MediumRiskMin = table.Column<int>(type: "int", nullable: false),
                    MediumRiskMax = table.Column<int>(type: "int", nullable: false),
                    HighRiskMax = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RiskThresholds", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RiskThresholds_IsActive",
                table: "RiskThresholds",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_RiskThresholds_RuleName",
                table: "RiskThresholds",
                column: "RuleName",
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
