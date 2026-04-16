using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GapSense.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class AddFollowUpTasks : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "FollowUpTasks",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                StudentProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Title = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                DueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                Status = table.Column<int>(type: "int", nullable: false),
                Priority = table.Column<int>(type: "int", nullable: false),
                AssignedTo = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                ReminderSentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                IsDismissed = table.Column<bool>(type: "bit", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                IsActive = table.Column<bool>(type: "bit", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_FollowUpTasks", x => x.Id);
                table.ForeignKey(
                    name: "FK_FollowUpTasks_StudentProfiles_StudentProfileId",
                    column: x => x.StudentProfileId,
                    principalTable: "StudentProfiles",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_FollowUpTasks_CreatedAt",
            table: "FollowUpTasks",
            column: "CreatedAt");

        migrationBuilder.CreateIndex(
            name: "IX_FollowUpTasks_DueDate",
            table: "FollowUpTasks",
            column: "DueDate");

        migrationBuilder.CreateIndex(
            name: "IX_FollowUpTasks_IsDismissed",
            table: "FollowUpTasks",
            column: "IsDismissed");

        migrationBuilder.CreateIndex(
            name: "IX_FollowUpTasks_Status",
            table: "FollowUpTasks",
            column: "Status");

        migrationBuilder.CreateIndex(
            name: "IX_FollowUpTasks_StudentProfileId",
            table: "FollowUpTasks",
            column: "StudentProfileId");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "FollowUpTasks");
    }
}
