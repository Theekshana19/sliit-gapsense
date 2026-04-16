using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GapSense.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBatchReadinessIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StudentProfiles_SemesterId",
                table: "StudentProfiles");

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfiles_CurrentModule",
                table: "StudentProfiles",
                column: "CurrentModule");

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfiles_RiskLevel",
                table: "StudentProfiles",
                column: "RiskLevel");

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfiles_SemesterId_Batch",
                table: "StudentProfiles",
                columns: new[] { "SemesterId", "Batch" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StudentProfiles_CurrentModule",
                table: "StudentProfiles");

            migrationBuilder.DropIndex(
                name: "IX_StudentProfiles_RiskLevel",
                table: "StudentProfiles");

            migrationBuilder.DropIndex(
                name: "IX_StudentProfiles_SemesterId_Batch",
                table: "StudentProfiles");

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfiles_SemesterId",
                table: "StudentProfiles",
                column: "SemesterId");
        }
    }
}
