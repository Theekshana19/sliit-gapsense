using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GapSense.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOptionalProductModules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CourseModules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table => { table.PrimaryKey("PK_CourseModules", x => x.Id); });

            migrationBuilder.CreateTable(
                name: "StudentInterventions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table => { table.PrimaryKey("PK_StudentInterventions", x => x.Id); });

            migrationBuilder.CreateTable(
                name: "LecturerModuleAssignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LecturerUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CourseModuleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssignedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LecturerModuleAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LecturerModuleAssignments_CourseModules_CourseModuleId",
                        column: x => x.CourseModuleId,
                        principalTable: "CourseModules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourseModules_Code",
                table: "CourseModules",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LecturerModuleAssignments_Lecturer_Module",
                table: "LecturerModuleAssignments",
                columns: new[] { "LecturerUserId", "CourseModuleId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LecturerModuleAssignments_LecturerUserId",
                table: "LecturerModuleAssignments",
                column: "LecturerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentInterventions_Status",
                table: "StudentInterventions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_StudentInterventions_StudentUserId",
                table: "StudentInterventions",
                column: "StudentUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LecturerModuleAssignments");

            migrationBuilder.DropTable(
                name: "StudentInterventions");

            migrationBuilder.DropTable(
                name: "CourseModules");
        }
    }
}
