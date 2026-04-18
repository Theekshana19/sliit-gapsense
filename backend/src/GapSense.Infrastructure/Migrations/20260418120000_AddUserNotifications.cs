using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GapSense.Infrastructure.Migrations;

/// <inheritdoc />
public partial class AddUserNotifications : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "UserNotifications",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                Message = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                Type = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                IsRead = table.Column<bool>(type: "bit", nullable: false),
                CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table => { table.PrimaryKey("PK_UserNotifications", x => x.Id); });

        migrationBuilder.CreateIndex(
            name: "IX_UserNotifications_UserId_CreatedAtUtc",
            table: "UserNotifications",
            columns: new[] { "UserId", "CreatedAtUtc" });
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "UserNotifications");
    }
}
