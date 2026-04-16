using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GapSense.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddInterventionPlanning : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InterventionPlans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ModuleCode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Batch = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    RiskGroup = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    WeakTopic = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    InterventionType = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    PlannedDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    AssignedLecturer = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    StudentProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDraft = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterventionPlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterventionPlans_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "InterventionReviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InterventionPlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReviewDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Outcome = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ImprovementPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterventionReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterventionReviews_InterventionPlans_InterventionPlanId",
                        column: x => x.InterventionPlanId,
                        principalTable: "InterventionPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InterventionPlans_Batch",
                table: "InterventionPlans",
                column: "Batch");

            migrationBuilder.CreateIndex(
                name: "IX_InterventionPlans_CreatedAt",
                table: "InterventionPlans",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_InterventionPlans_IsActive_Status",
                table: "InterventionPlans",
                columns: new[] { "IsActive", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_InterventionPlans_ModuleCode",
                table: "InterventionPlans",
                column: "ModuleCode");

            migrationBuilder.CreateIndex(
                name: "IX_InterventionPlans_PlannedDate",
                table: "InterventionPlans",
                column: "PlannedDate");

            migrationBuilder.CreateIndex(
                name: "IX_InterventionPlans_RiskGroup",
                table: "InterventionPlans",
                column: "RiskGroup");

            migrationBuilder.CreateIndex(
                name: "IX_InterventionPlans_Status",
                table: "InterventionPlans",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_InterventionPlans_StudentProfileId",
                table: "InterventionPlans",
                column: "StudentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_InterventionReviews_InterventionPlanId",
                table: "InterventionReviews",
                column: "InterventionPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_InterventionReviews_IsCompleted",
                table: "InterventionReviews",
                column: "IsCompleted");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InterventionReviews");

            migrationBuilder.DropTable(
                name: "InterventionPlans");
        }
    }
}
