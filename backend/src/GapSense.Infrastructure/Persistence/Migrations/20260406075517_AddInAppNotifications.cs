using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GapSense.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddInAppNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InAppNotifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LecturerProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InAppNotifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InAppNotifications_LecturerProfiles_LecturerProfileId",
                        column: x => x.LecturerProfileId,
                        principalTable: "LecturerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "InAppNotifications",
                columns: new[] { "Id", "CreatedAt", "IsActive", "IsRead", "LecturerProfileId", "Message", "Title", "Type", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-4000-8000-000000000001"), new DateTime(2026, 4, 6, 10, 58, 0, 0, DateTimeKind.Utc), true, false, new Guid("00000000-0000-4000-8000-000000000001"), "INTE 3123 — 3 students flagged for follow-up this week.", "High-risk student detected", 0, null },
                    { new Guid("10000000-0000-4000-8000-000000000002"), new DateTime(2026, 4, 6, 10, 42, 0, 0, DateTimeKind.Utc), true, false, new Guid("00000000-0000-4000-8000-000000000001"), "Batch SE-24 — attendance below 75% threshold.", "Low attendance warning", 0, null },
                    { new Guid("10000000-0000-4000-8000-000000000003"), new DateTime(2026, 4, 6, 9, 30, 0, 0, DateTimeKind.Utc), true, true, new Guid("00000000-0000-4000-8000-000000000001"), "Mid-term average dropped vs last semester in Data Structures.", "Low performance alert", 0, null },
                    { new Guid("10000000-0000-4000-8000-000000000004"), new DateTime(2026, 4, 6, 8, 30, 0, 0, DateTimeKind.Utc), true, false, new Guid("00000000-0000-4000-8000-000000000001"), "Assignment 02 marks published for INTE 3123.", "Marks uploaded", 1, null },
                    { new Guid("10000000-0000-4000-8000-000000000005"), new DateTime(2026, 4, 6, 7, 30, 0, 0, DateTimeKind.Utc), true, false, new Guid("00000000-0000-4000-8000-000000000001"), "12 new submissions pending review for Week 5 lab.", "Assignment submitted", 1, null },
                    { new Guid("10000000-0000-4000-8000-000000000006"), new DateTime(2026, 4, 5, 12, 0, 0, 0, DateTimeKind.Utc), true, true, new Guid("00000000-0000-4000-8000-000000000001"), "Learning outcomes revised for INTE 3123 — please review.", "Module updated", 1, null },
                    { new Guid("10000000-0000-4000-8000-000000000007"), new DateTime(2026, 4, 5, 8, 0, 0, 0, DateTimeKind.Utc), true, false, new Guid("00000000-0000-4000-8000-000000000001"), "Lecture tomorrow 9:00 AM — Hall B-204.", "Upcoming lecture", 2, null },
                    { new Guid("10000000-0000-4000-8000-000000000008"), new DateTime(2026, 4, 5, 7, 0, 0, 0, DateTimeKind.Utc), true, true, new Guid("00000000-0000-4000-8000-000000000001"), "Faculty curriculum sync in 45 minutes (Teams).", "Meeting reminder", 2, null },
                    { new Guid("10000000-0000-4000-8000-000000000009"), new DateTime(2026, 4, 4, 12, 0, 0, 0, DateTimeKind.Utc), true, false, new Guid("00000000-0000-4000-8000-000000000001"), "3 intervention plans due for review by Friday.", "Intervention follow-up", 2, null },
                    { new Guid("10000000-0000-4000-8000-000000000010"), new DateTime(2026, 4, 4, 10, 0, 0, 0, DateTimeKind.Utc), true, true, new Guid("00000000-0000-4000-8000-000000000001"), "Semester risk summary PDF is ready to download.", "Report generated", 3, null },
                    { new Guid("10000000-0000-4000-8000-000000000011"), new DateTime(2026, 4, 3, 12, 0, 0, 0, DateTimeKind.Utc), true, true, new Guid("00000000-0000-4000-8000-000000000001"), "Your notification preferences were saved successfully.", "Settings updated", 3, null },
                    { new Guid("10000000-0000-4000-8000-000000000012"), new DateTime(2026, 4, 2, 12, 0, 0, 0, DateTimeKind.Utc), true, false, new Guid("00000000-0000-4000-8000-000000000001"), "5 students enrolled in INTE 3123 for Semester 2.", "New student added", 3, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_InAppNotifications_LecturerProfileId_CreatedAt",
                table: "InAppNotifications",
                columns: new[] { "LecturerProfileId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_InAppNotifications_LecturerProfileId_IsRead",
                table: "InAppNotifications",
                columns: new[] { "LecturerProfileId", "IsRead" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InAppNotifications");
        }
    }
}
