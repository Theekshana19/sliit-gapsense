using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GapSense.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLecturerNotificationSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LecturerNotificationSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LecturerProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmailAlerts = table.Column<bool>(type: "bit", nullable: false),
                    StudentRiskAlerts = table.Column<bool>(type: "bit", nullable: false),
                    AssignmentReminders = table.Column<bool>(type: "bit", nullable: false),
                    WeeklyReports = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LecturerNotificationSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LecturerNotificationSettings_LecturerProfiles_LecturerProfileId",
                        column: x => x.LecturerProfileId,
                        principalTable: "LecturerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "LecturerNotificationSettings",
                columns: new[] { "Id", "AssignmentReminders", "CreatedAt", "EmailAlerts", "IsActive", "LecturerProfileId", "StudentRiskAlerts", "UpdatedAt", "WeeklyReports" },
                values: new object[] { new Guid("00000000-0000-4000-8000-000000000003"), false, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, true, new Guid("00000000-0000-4000-8000-000000000001"), true, null, true });

            migrationBuilder.CreateIndex(
                name: "IX_LecturerNotificationSettings_LecturerProfileId",
                table: "LecturerNotificationSettings",
                column: "LecturerProfileId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LecturerNotificationSettings");
        }
    }
}
