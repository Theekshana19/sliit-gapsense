using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GapSense.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLecturerSettingsModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[LecturerProfiles]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [LecturerProfiles] (
                        [Id] uniqueidentifier NOT NULL,
                        [FullName] nvarchar(200) NOT NULL,
                        [Email] nvarchar(256) NOT NULL,
                        [PhoneNumber] nvarchar(32) NULL,
                        [Department] nvarchar(128) NOT NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        [UpdatedAt] datetime2 NULL,
                        [IsActive] bit NOT NULL,
                        CONSTRAINT [PK_LecturerProfiles] PRIMARY KEY ([Id])
                    );
                END
                """);

            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[LecturerAcademicSettings]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [LecturerAcademicSettings] (
                        [Id] uniqueidentifier NOT NULL,
                        [LecturerProfileId] uniqueidentifier NOT NULL,
                        [Semester] nvarchar(64) NOT NULL,
                        [AcademicYear] nvarchar(32) NOT NULL,
                        [DefaultModule] nvarchar(128) NOT NULL,
                        [AssignedFaculty] nvarchar(128) NOT NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        [UpdatedAt] datetime2 NULL,
                        [IsActive] bit NOT NULL,
                        CONSTRAINT [PK_LecturerAcademicSettings] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_LecturerAcademicSettings_LecturerProfiles_LecturerProfileId] FOREIGN KEY ([LecturerProfileId]) REFERENCES [LecturerProfiles]([Id]) ON DELETE CASCADE
                    );
                END
                """);

            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[LecturerNotificationSettings]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [LecturerNotificationSettings] (
                        [Id] uniqueidentifier NOT NULL,
                        [LecturerProfileId] uniqueidentifier NOT NULL,
                        [EmailAlerts] bit NOT NULL,
                        [StudentRiskAlerts] bit NOT NULL,
                        [AssignmentReminders] bit NOT NULL,
                        [WeeklyReports] bit NOT NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        [UpdatedAt] datetime2 NULL,
                        [IsActive] bit NOT NULL,
                        CONSTRAINT [PK_LecturerNotificationSettings] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_LecturerNotificationSettings_LecturerProfiles_LecturerProfileId] FOREIGN KEY ([LecturerProfileId]) REFERENCES [LecturerProfiles]([Id]) ON DELETE CASCADE
                    );
                END
                """);

            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[LecturerSecuritySettings]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [LecturerSecuritySettings] (
                        [Id] uniqueidentifier NOT NULL,
                        [LecturerProfileId] uniqueidentifier NOT NULL,
                        [TwoFactorEnabled] bit NOT NULL,
                        [LoginAlertEnabled] bit NOT NULL,
                        [SessionTimeoutMinutes] int NOT NULL,
                        [PasswordHash] nvarchar(128) NOT NULL,
                        [PasswordChangedAtUtc] datetime2 NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        [UpdatedAt] datetime2 NULL,
                        [IsActive] bit NOT NULL,
                        CONSTRAINT [PK_LecturerSecuritySettings] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_LecturerSecuritySettings_LecturerProfiles_LecturerProfileId] FOREIGN KEY ([LecturerProfileId]) REFERENCES [LecturerProfiles]([Id]) ON DELETE CASCADE
                    );
                END
                """);

            migrationBuilder.Sql("IF COL_LENGTH('LecturerProfiles', 'Department') IS NULL ALTER TABLE [LecturerProfiles] ADD [Department] nvarchar(128) NOT NULL CONSTRAINT [DF_LecturerProfiles_Department] DEFAULT(N'Faculty of Computing');");
            migrationBuilder.Sql("IF COL_LENGTH('LecturerAcademicSettings', 'AssignedFaculty') IS NULL ALTER TABLE [LecturerAcademicSettings] ADD [AssignedFaculty] nvarchar(128) NOT NULL CONSTRAINT [DF_LecturerAcademicSettings_AssignedFaculty] DEFAULT(N'Faculty of Computing');");
            migrationBuilder.Sql("IF COL_LENGTH('LecturerNotificationSettings', 'WeeklyReports') IS NULL ALTER TABLE [LecturerNotificationSettings] ADD [WeeklyReports] bit NOT NULL CONSTRAINT [DF_LecturerNotificationSettings_WeeklyReports] DEFAULT(1);");
            migrationBuilder.Sql("IF COL_LENGTH('LecturerSecuritySettings', 'LoginAlertEnabled') IS NULL ALTER TABLE [LecturerSecuritySettings] ADD [LoginAlertEnabled] bit NOT NULL CONSTRAINT [DF_LecturerSecuritySettings_LoginAlertEnabled] DEFAULT(1);");
            migrationBuilder.Sql("IF COL_LENGTH('LecturerSecuritySettings', 'SessionTimeoutMinutes') IS NULL ALTER TABLE [LecturerSecuritySettings] ADD [SessionTimeoutMinutes] int NOT NULL CONSTRAINT [DF_LecturerSecuritySettings_SessionTimeoutMinutes] DEFAULT(30);");
            migrationBuilder.Sql("IF COL_LENGTH('LecturerSecuritySettings', 'PasswordChangedAtUtc') IS NULL ALTER TABLE [LecturerSecuritySettings] ADD [PasswordChangedAtUtc] datetime2 NULL;");

            migrationBuilder.Sql("IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_LecturerProfiles_Email' AND object_id = OBJECT_ID(N'[LecturerProfiles]')) CREATE UNIQUE INDEX [IX_LecturerProfiles_Email] ON [LecturerProfiles] ([Email]);");
            migrationBuilder.Sql("IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_LecturerAcademicSettings_LecturerProfileId' AND object_id = OBJECT_ID(N'[LecturerAcademicSettings]')) CREATE UNIQUE INDEX [IX_LecturerAcademicSettings_LecturerProfileId] ON [LecturerAcademicSettings] ([LecturerProfileId]);");
            migrationBuilder.Sql("IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_LecturerNotificationSettings_LecturerProfileId' AND object_id = OBJECT_ID(N'[LecturerNotificationSettings]')) CREATE UNIQUE INDEX [IX_LecturerNotificationSettings_LecturerProfileId] ON [LecturerNotificationSettings] ([LecturerProfileId]);");
            migrationBuilder.Sql("IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_LecturerSecuritySettings_LecturerProfileId' AND object_id = OBJECT_ID(N'[LecturerSecuritySettings]')) CREATE UNIQUE INDEX [IX_LecturerSecuritySettings_LecturerProfileId] ON [LecturerSecuritySettings] ([LecturerProfileId]);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LecturerAcademicSettings");

            migrationBuilder.DropTable(
                name: "LecturerNotificationSettings");

            migrationBuilder.DropTable(
                name: "LecturerSecuritySettings");

            migrationBuilder.DropTable(
                name: "LecturerProfiles");
        }
    }
}
