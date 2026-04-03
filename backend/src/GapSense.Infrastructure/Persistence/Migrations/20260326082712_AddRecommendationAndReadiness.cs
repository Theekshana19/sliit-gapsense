using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GapSense.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRecommendationAndReadiness : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ReadinessResults",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ModuleCode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Batch = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Semester = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ReadinessScore = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReadinessResults", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RecommendationRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RuleName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RiskLevel = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    ResourceType = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    ActionText = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecommendationRules", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReadinessResults_Batch_Semester",
                table: "ReadinessResults",
                columns: new[] { "Batch", "Semester" });

            migrationBuilder.CreateIndex(
                name: "IX_ReadinessResults_ModuleCode",
                table: "ReadinessResults",
                column: "ModuleCode");

            migrationBuilder.CreateIndex(
                name: "IX_ReadinessResults_StudentId",
                table: "ReadinessResults",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_RecommendationRules_RiskLevel_ResourceType",
                table: "RecommendationRules",
                columns: new[] { "RiskLevel", "ResourceType" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ReadinessResults");

            migrationBuilder.DropTable(
                name: "RecommendationRules");
        }
    }
}
