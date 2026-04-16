using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GapSense.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PatchLecturerSettingsLegacySchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("IF COL_LENGTH('LecturerProfiles', 'Department') IS NULL ALTER TABLE [LecturerProfiles] ADD [Department] nvarchar(128) NOT NULL CONSTRAINT [DF_LecturerProfiles_Department_Patch] DEFAULT(N'Faculty of Computing');");
            migrationBuilder.Sql("IF COL_LENGTH('LecturerAcademicSettings', 'AssignedFaculty') IS NULL ALTER TABLE [LecturerAcademicSettings] ADD [AssignedFaculty] nvarchar(128) NOT NULL CONSTRAINT [DF_LecturerAcademicSettings_AssignedFaculty_Patch] DEFAULT(N'Faculty of Computing');");
            migrationBuilder.Sql("IF COL_LENGTH('LecturerNotificationSettings', 'WeeklyReports') IS NULL ALTER TABLE [LecturerNotificationSettings] ADD [WeeklyReports] bit NOT NULL CONSTRAINT [DF_LecturerNotificationSettings_WeeklyReports_Patch] DEFAULT(1);");
            migrationBuilder.Sql("IF COL_LENGTH('LecturerSecuritySettings', 'LoginAlertEnabled') IS NULL ALTER TABLE [LecturerSecuritySettings] ADD [LoginAlertEnabled] bit NOT NULL CONSTRAINT [DF_LecturerSecuritySettings_LoginAlertEnabled_Patch] DEFAULT(1);");
            migrationBuilder.Sql("IF COL_LENGTH('LecturerSecuritySettings', 'SessionTimeoutMinutes') IS NULL ALTER TABLE [LecturerSecuritySettings] ADD [SessionTimeoutMinutes] int NOT NULL CONSTRAINT [DF_LecturerSecuritySettings_SessionTimeoutMinutes_Patch] DEFAULT(30);");
            migrationBuilder.Sql("IF COL_LENGTH('LecturerSecuritySettings', 'PasswordChangedAtUtc') IS NULL ALTER TABLE [LecturerSecuritySettings] ADD [PasswordChangedAtUtc] datetime2 NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
