using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GapSense.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRecommendationRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RecommendationRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RuleName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ModuleCode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ModuleName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    TopicName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ConditionType = table.Column<int>(type: "int", nullable: false),
                    ScoreThreshold = table.Column<int>(type: "int", nullable: false),
                    RecommendationTitle = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ResourceType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PriorityLevel = table.Column<int>(type: "int", nullable: false),
                    ResourceUrl = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    AttachmentPath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AdministrativeRationale = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecommendationRules", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RecommendationRules_Module_Topic_Condition_Score",
                table: "RecommendationRules",
                columns: new[] { "ModuleCode", "TopicName", "ConditionType", "ScoreThreshold" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecommendationRules_ModuleCode",
                table: "RecommendationRules",
                column: "ModuleCode");

            migrationBuilder.CreateIndex(
                name: "IX_RecommendationRules_Status",
                table: "RecommendationRules",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RecommendationRules");
        }
    }
}
