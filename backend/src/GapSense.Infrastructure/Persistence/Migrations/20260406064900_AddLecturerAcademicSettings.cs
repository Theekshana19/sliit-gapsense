using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GapSense.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLecturerAcademicSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LecturerAcademicSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LecturerProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Semester = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    AcademicYear = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    DefaultModule = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AssignedFaculty = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LecturerAcademicSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LecturerAcademicSettings_LecturerProfiles_LecturerProfileId",
                        column: x => x.LecturerProfileId,
                        principalTable: "LecturerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "LecturerAcademicSettings",
                columns: new[] { "Id", "AcademicYear", "AssignedFaculty", "CreatedAt", "DefaultModule", "IsActive", "LecturerProfileId", "Semester", "UpdatedAt" },
                values: new object[] { new Guid("00000000-0000-4000-8000-000000000002"), "2025/2026", "Faculty of Computing — Software Engineering", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "INTE 3123 — Data Structures & Algorithms", true, new Guid("00000000-0000-4000-8000-000000000001"), "Semester 1", null });

            migrationBuilder.CreateIndex(
                name: "IX_LecturerAcademicSettings_LecturerProfileId",
                table: "LecturerAcademicSettings",
                column: "LecturerProfileId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LecturerAcademicSettings");
        }
    }
}
