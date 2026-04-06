using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GapSense.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLecturerProfiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LecturerProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Department = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LecturerProfiles", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "LecturerProfiles",
                columns: new[] { "Id", "CreatedAt", "Department", "Email", "FullName", "IsActive", "PhoneNumber", "UpdatedAt" },
                values: new object[] { new Guid("00000000-0000-4000-8000-000000000001"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Faculty of Computing", "nimal.perera@sliit.lk", "Dr. Nimal Perera", true, "+94 77 123 4567", null });

            migrationBuilder.CreateIndex(
                name: "IX_LecturerProfiles_CreatedAt",
                table: "LecturerProfiles",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_LecturerProfiles_Email",
                table: "LecturerProfiles",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LecturerProfiles");
        }
    }
}
