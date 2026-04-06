using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GapSense.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLecturerSecuritySettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LecturerSecuritySettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LecturerProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LastLogoutAllDevicesUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LecturerSecuritySettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LecturerSecuritySettings_LecturerProfiles_LecturerProfileId",
                        column: x => x.LecturerProfileId,
                        principalTable: "LecturerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "LecturerSecuritySettings",
                columns: new[] { "Id", "CreatedAt", "IsActive", "LastLogoutAllDevicesUtc", "LecturerProfileId", "PasswordHash", "TwoFactorEnabled", "UpdatedAt" },
                values: new object[] { new Guid("00000000-0000-4000-8000-000000000004"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, null, new Guid("00000000-0000-4000-8000-000000000001"), null, false, null });

            migrationBuilder.CreateIndex(
                name: "IX_LecturerSecuritySettings_LecturerProfileId",
                table: "LecturerSecuritySettings",
                column: "LecturerProfileId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LecturerSecuritySettings");
        }
    }
}
