using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GapSense.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CurriculumReadinessAndLegacyQuizzes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Idempotent: supports first run, re-run after partial failure, and DBs that already have Sewwandi tables.
            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID(N'[QuizAttempts]') AND name = N'FK_QuizAttempts_Quizzes_QuizId')
    ALTER TABLE [QuizAttempts] DROP CONSTRAINT [FK_QuizAttempts_Quizzes_QuizId];

IF OBJECT_ID(N'[Quizzes]', N'U') IS NOT NULL
    EXEC sp_rename N'[Quizzes]', N'LegacyQuizzes';

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Quizzes_IsPublished' AND object_id = OBJECT_ID(N'[LegacyQuizzes]'))
    EXEC sp_rename N'[LegacyQuizzes].[IX_Quizzes_IsPublished]', N'IX_LegacyQuizzes_IsPublished', N'INDEX';

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Quizzes_ModuleCode' AND object_id = OBJECT_ID(N'[LegacyQuizzes]'))
    EXEC sp_rename N'[LegacyQuizzes].[IX_Quizzes_ModuleCode]', N'IX_LegacyQuizzes_ModuleCode', N'INDEX';

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_QuizAttempts_LegacyQuizzes_QuizId')
   AND OBJECT_ID(N'[LegacyQuizzes]', N'U') IS NOT NULL
BEGIN
    ALTER TABLE [QuizAttempts] ADD CONSTRAINT [FK_QuizAttempts_LegacyQuizzes_QuizId]
        FOREIGN KEY ([QuizId]) REFERENCES [LegacyQuizzes] ([Id]) ON DELETE CASCADE;
END
");

            migrationBuilder.Sql(@"
IF OBJECT_ID(N'[Modules]', N'U') IS NULL
BEGIN
    CREATE TABLE [Modules] (
        [Id] uniqueidentifier NOT NULL,
        [ModuleCode] nvarchar(6) NOT NULL,
        [ModuleName] nvarchar(200) NOT NULL,
        [Description] nvarchar(1000) NOT NULL,
        [Program] nvarchar(20) NOT NULL,
        [Semester] nvarchar(10) NOT NULL,
        [Credits] int NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Modules] PRIMARY KEY ([Id])
    );
END

IF OBJECT_ID(N'[ValidationAlerts]', N'U') IS NULL
BEGIN
    CREATE TABLE [ValidationAlerts] (
        [Id] uniqueidentifier NOT NULL,
        [Type] nvarchar(50) NOT NULL,
        [ModuleCode] nvarchar(6) NOT NULL,
        [ModuleName] nvarchar(200) NOT NULL,
        [Severity] nvarchar(20) NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_ValidationAlerts] PRIMARY KEY ([Id])
    );
END

IF OBJECT_ID(N'[Prerequisites]', N'U') IS NULL
BEGIN
    CREATE TABLE [Prerequisites] (
        [Id] uniqueidentifier NOT NULL,
        [MainModuleId] uniqueidentifier NOT NULL,
        [PrerequisiteModuleId] uniqueidentifier NOT NULL,
        [RelationshipType] nvarchar(20) NOT NULL,
        [RelevanceWeight] int NOT NULL,
        [Notes] nvarchar(500) NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Prerequisites] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Prerequisites_Modules_MainModuleId] FOREIGN KEY ([MainModuleId]) REFERENCES [Modules] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Prerequisites_Modules_PrerequisiteModuleId] FOREIGN KEY ([PrerequisiteModuleId]) REFERENCES [Modules] ([Id]) ON DELETE NO ACTION
    );
END

IF OBJECT_ID(N'[ReadinessQuizzes]', N'U') IS NULL
BEGIN
    CREATE TABLE [ReadinessQuizzes] (
        [Id] uniqueidentifier NOT NULL,
        [Title] nvarchar(300) NOT NULL,
        [Description] nvarchar(1000) NOT NULL,
        [ModuleId] uniqueidentifier NOT NULL,
        [Intake] nvarchar(50) NOT NULL,
        [TotalMarks] int NOT NULL,
        [PassingPercentage] int NOT NULL,
        [TimeLimitMinutes] int NOT NULL,
        [MaxAttempts] int NOT NULL,
        [ShuffleQuestions] bit NOT NULL,
        [ShuffleOptions] bit NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_ReadinessQuizzes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ReadinessQuizzes_Modules_ModuleId] FOREIGN KEY ([ModuleId]) REFERENCES [Modules] ([Id]) ON DELETE NO ACTION
    );
END

IF OBJECT_ID(N'[Resources]', N'U') IS NULL
BEGIN
    CREATE TABLE [Resources] (
        [Id] uniqueidentifier NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [Description] nvarchar(1000) NOT NULL,
        [Type] nvarchar(20) NOT NULL,
        [Url] nvarchar(500) NOT NULL,
        [Topic] nvarchar(200) NOT NULL,
        [ModuleId] uniqueidentifier NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Resources] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Resources_Modules_ModuleId] FOREIGN KEY ([ModuleId]) REFERENCES [Modules] ([Id]) ON DELETE NO ACTION
    );
END

IF OBJECT_ID(N'[SemesterOfferings]', N'U') IS NULL
BEGIN
    CREATE TABLE [SemesterOfferings] (
        [Id] uniqueidentifier NOT NULL,
        [ModuleId] uniqueidentifier NOT NULL,
        [Program] nvarchar(20) NOT NULL,
        [Intake] nvarchar(50) NOT NULL,
        [Semester] nvarchar(10) NOT NULL,
        [LecturerName] nvarchar(100) NOT NULL,
        [LecturerAvatar] nvarchar(5) NOT NULL,
        [AvatarColor] nvarchar(50) NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_SemesterOfferings] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_SemesterOfferings_Modules_ModuleId] FOREIGN KEY ([ModuleId]) REFERENCES [Modules] ([Id]) ON DELETE CASCADE
    );
END

IF OBJECT_ID(N'[Topics]', N'U') IS NULL
BEGIN
    CREATE TABLE [Topics] (
        [Id] uniqueidentifier NOT NULL,
        [ModuleId] uniqueidentifier NOT NULL,
        [TopicName] nvarchar(200) NOT NULL,
        [Description] nvarchar(1000) NOT NULL,
        [Weight] int NOT NULL,
        [ImportanceLevel] nvarchar(20) NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Topics] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Topics_Modules_ModuleId] FOREIGN KEY ([ModuleId]) REFERENCES [Modules] ([Id]) ON DELETE CASCADE
    );
END

IF OBJECT_ID(N'[QuizSchedules]', N'U') IS NULL
BEGIN
    CREATE TABLE [QuizSchedules] (
        [Id] uniqueidentifier NOT NULL,
        [QuizId] uniqueidentifier NOT NULL,
        [StartDate] datetime2 NOT NULL,
        [EndDate] datetime2 NOT NULL,
        [MaxAttempts] int NOT NULL,
        [ResultVisibility] nvarchar(20) NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_QuizSchedules] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_QuizSchedules_ReadinessQuizzes_QuizId] FOREIGN KEY ([QuizId]) REFERENCES [ReadinessQuizzes] ([Id]) ON DELETE CASCADE
    );
END

IF OBJECT_ID(N'[Submissions]', N'U') IS NULL
BEGIN
    CREATE TABLE [Submissions] (
        [Id] uniqueidentifier NOT NULL,
        [QuizId] uniqueidentifier NOT NULL,
        [StudentId] nvarchar(20) NOT NULL,
        [StudentName] nvarchar(100) NOT NULL,
        [StudentAvatar] nvarchar(5) NOT NULL,
        [AvatarColor] nvarchar(50) NOT NULL,
        [AttemptNumber] int NOT NULL,
        [Score] int NOT NULL,
        [TotalMarks] int NOT NULL,
        [Percentage] decimal(5,2) NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [StartedAt] datetime2 NOT NULL,
        [SubmittedAt] datetime2 NULL,
        [TimeTakenMinutes] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Submissions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Submissions_ReadinessQuizzes_QuizId] FOREIGN KEY ([QuizId]) REFERENCES [ReadinessQuizzes] ([Id]) ON DELETE NO ACTION
    );
END

IF OBJECT_ID(N'[Questions]', N'U') IS NULL
BEGIN
    CREATE TABLE [Questions] (
        [Id] uniqueidentifier NOT NULL,
        [QuestionDisplayId] nvarchar(20) NOT NULL,
        [Title] nvarchar(300) NOT NULL,
        [QuestionText] nvarchar(2000) NOT NULL,
        [QuestionType] nvarchar(20) NOT NULL,
        [Difficulty] nvarchar(20) NOT NULL,
        [ModuleId] uniqueidentifier NOT NULL,
        [TopicId] uniqueidentifier NULL,
        [Explanation] nvarchar(1000) NOT NULL,
        [Marks] int NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Questions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Questions_Modules_ModuleId] FOREIGN KEY ([ModuleId]) REFERENCES [Modules] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Questions_Topics_TopicId] FOREIGN KEY ([TopicId]) REFERENCES [Topics] ([Id]) ON DELETE SET NULL
    );
END

IF OBJECT_ID(N'[QuestionOptions]', N'U') IS NULL
BEGIN
    CREATE TABLE [QuestionOptions] (
        [Id] uniqueidentifier NOT NULL,
        [QuestionId] uniqueidentifier NOT NULL,
        [OptionText] nvarchar(500) NOT NULL,
        [IsCorrect] bit NOT NULL,
        [SortOrder] int NOT NULL,
        CONSTRAINT [PK_QuestionOptions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_QuestionOptions_Questions_QuestionId] FOREIGN KEY ([QuestionId]) REFERENCES [Questions] ([Id]) ON DELETE CASCADE
    );
END

IF OBJECT_ID(N'[QuizQuestions]', N'U') IS NULL
BEGIN
    CREATE TABLE [QuizQuestions] (
        [Id] uniqueidentifier NOT NULL,
        [QuizId] uniqueidentifier NOT NULL,
        [QuestionId] uniqueidentifier NOT NULL,
        [SortOrder] int NOT NULL,
        [Marks] int NOT NULL,
        CONSTRAINT [PK_QuizQuestions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_QuizQuestions_Questions_QuestionId] FOREIGN KEY ([QuestionId]) REFERENCES [Questions] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_QuizQuestions_ReadinessQuizzes_QuizId] FOREIGN KEY ([QuizId]) REFERENCES [ReadinessQuizzes] ([Id]) ON DELETE CASCADE
    );
END

IF OBJECT_ID(N'[SubmissionAnswers]', N'U') IS NULL
BEGIN
    CREATE TABLE [SubmissionAnswers] (
        [Id] uniqueidentifier NOT NULL,
        [SubmissionId] uniqueidentifier NOT NULL,
        [QuestionId] uniqueidentifier NOT NULL,
        [SelectedOptionId] uniqueidentifier NULL,
        [IsCorrect] bit NOT NULL,
        [Marks] int NOT NULL,
        CONSTRAINT [PK_SubmissionAnswers] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_SubmissionAnswers_Questions_QuestionId] FOREIGN KEY ([QuestionId]) REFERENCES [Questions] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_SubmissionAnswers_Submissions_SubmissionId] FOREIGN KEY ([SubmissionId]) REFERENCES [Submissions] ([Id]) ON DELETE CASCADE
    );
END
");

            migrationBuilder.Sql(@"
-- LecturerModuleAssignments is created in a later migration (20260429120000_AddOptionalProductModules).
IF OBJECT_ID(N'[LecturerModuleAssignments]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes i INNER JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name = N'LecturerModuleAssignments' AND i.name = N'IX_LecturerModuleAssignments_CourseModuleId')
    CREATE INDEX [IX_LecturerModuleAssignments_CourseModuleId] ON [LecturerModuleAssignments] ([CourseModuleId]);

IF NOT EXISTS (SELECT 1 FROM sys.indexes i INNER JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name = N'Modules' AND i.name = N'IX_Modules_ModuleCode')
    CREATE UNIQUE INDEX [IX_Modules_ModuleCode] ON [Modules] ([ModuleCode]);

IF NOT EXISTS (SELECT 1 FROM sys.indexes i INNER JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name = N'Prerequisites' AND i.name = N'IX_Prerequisites_MainModuleId_PrerequisiteModuleId')
    CREATE UNIQUE INDEX [IX_Prerequisites_MainModuleId_PrerequisiteModuleId] ON [Prerequisites] ([MainModuleId], [PrerequisiteModuleId]);

IF NOT EXISTS (SELECT 1 FROM sys.indexes i INNER JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name = N'Prerequisites' AND i.name = N'IX_Prerequisites_PrerequisiteModuleId')
    CREATE INDEX [IX_Prerequisites_PrerequisiteModuleId] ON [Prerequisites] ([PrerequisiteModuleId]);

IF NOT EXISTS (SELECT 1 FROM sys.indexes i INNER JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name = N'QuestionOptions' AND i.name = N'IX_QuestionOptions_QuestionId')
    CREATE INDEX [IX_QuestionOptions_QuestionId] ON [QuestionOptions] ([QuestionId]);

IF NOT EXISTS (SELECT 1 FROM sys.indexes i INNER JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name = N'Questions' AND i.name = N'IX_Questions_ModuleId')
    CREATE INDEX [IX_Questions_ModuleId] ON [Questions] ([ModuleId]);

IF NOT EXISTS (SELECT 1 FROM sys.indexes i INNER JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name = N'Questions' AND i.name = N'IX_Questions_QuestionDisplayId')
    CREATE UNIQUE INDEX [IX_Questions_QuestionDisplayId] ON [Questions] ([QuestionDisplayId]);

IF NOT EXISTS (SELECT 1 FROM sys.indexes i INNER JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name = N'Questions' AND i.name = N'IX_Questions_TopicId')
    CREATE INDEX [IX_Questions_TopicId] ON [Questions] ([TopicId]);

IF NOT EXISTS (SELECT 1 FROM sys.indexes i INNER JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name = N'QuizQuestions' AND i.name = N'IX_QuizQuestions_QuestionId')
    CREATE INDEX [IX_QuizQuestions_QuestionId] ON [QuizQuestions] ([QuestionId]);

IF NOT EXISTS (SELECT 1 FROM sys.indexes i INNER JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name = N'QuizQuestions' AND i.name = N'IX_QuizQuestions_QuizId_QuestionId')
    CREATE UNIQUE INDEX [IX_QuizQuestions_QuizId_QuestionId] ON [QuizQuestions] ([QuizId], [QuestionId]);

IF NOT EXISTS (SELECT 1 FROM sys.indexes i INNER JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name = N'QuizSchedules' AND i.name = N'IX_QuizSchedules_QuizId')
    CREATE INDEX [IX_QuizSchedules_QuizId] ON [QuizSchedules] ([QuizId]);

IF NOT EXISTS (SELECT 1 FROM sys.indexes i INNER JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name = N'ReadinessQuizzes' AND i.name = N'IX_ReadinessQuizzes_ModuleId')
    CREATE INDEX [IX_ReadinessQuizzes_ModuleId] ON [ReadinessQuizzes] ([ModuleId]);

IF NOT EXISTS (SELECT 1 FROM sys.indexes i INNER JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name = N'Resources' AND i.name = N'IX_Resources_ModuleId')
    CREATE INDEX [IX_Resources_ModuleId] ON [Resources] ([ModuleId]);

IF NOT EXISTS (SELECT 1 FROM sys.indexes i INNER JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name = N'SemesterOfferings' AND i.name = N'IX_SemesterOfferings_ModuleId')
    CREATE INDEX [IX_SemesterOfferings_ModuleId] ON [SemesterOfferings] ([ModuleId]);

IF NOT EXISTS (SELECT 1 FROM sys.indexes i INNER JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name = N'SubmissionAnswers' AND i.name = N'IX_SubmissionAnswers_QuestionId')
    CREATE INDEX [IX_SubmissionAnswers_QuestionId] ON [SubmissionAnswers] ([QuestionId]);

IF NOT EXISTS (SELECT 1 FROM sys.indexes i INNER JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name = N'SubmissionAnswers' AND i.name = N'IX_SubmissionAnswers_SubmissionId')
    CREATE INDEX [IX_SubmissionAnswers_SubmissionId] ON [SubmissionAnswers] ([SubmissionId]);

IF NOT EXISTS (SELECT 1 FROM sys.indexes i INNER JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name = N'Submissions' AND i.name = N'IX_Submissions_QuizId')
    CREATE INDEX [IX_Submissions_QuizId] ON [Submissions] ([QuizId]);

IF NOT EXISTS (SELECT 1 FROM sys.indexes i INNER JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name = N'Topics' AND i.name = N'IX_Topics_ModuleId')
    CREATE INDEX [IX_Topics_ModuleId] ON [Topics] ([ModuleId]);
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuizAttempts_LegacyQuizzes_QuizId",
                table: "QuizAttempts");

            migrationBuilder.RenameIndex(
                name: "IX_LegacyQuizzes_IsPublished",
                table: "LegacyQuizzes",
                newName: "IX_Quizzes_IsPublished");

            migrationBuilder.RenameIndex(
                name: "IX_LegacyQuizzes_ModuleCode",
                table: "LegacyQuizzes",
                newName: "IX_Quizzes_ModuleCode");

            migrationBuilder.RenameTable(
                name: "LegacyQuizzes",
                newName: "Quizzes");

            migrationBuilder.AddForeignKey(
                name: "FK_QuizAttempts_Quizzes_QuizId",
                table: "QuizAttempts",
                column: "QuizId",
                principalTable: "Quizzes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.DropTable(
                name: "Prerequisites");

            migrationBuilder.DropTable(
                name: "QuestionOptions");

            migrationBuilder.DropTable(
                name: "QuizQuestions");

            migrationBuilder.DropTable(
                name: "QuizSchedules");

            migrationBuilder.DropTable(
                name: "Resources");

            migrationBuilder.DropTable(
                name: "SemesterOfferings");

            migrationBuilder.DropTable(
                name: "SubmissionAnswers");

            migrationBuilder.DropTable(
                name: "ValidationAlerts");

            migrationBuilder.DropTable(
                name: "Questions");

            migrationBuilder.DropTable(
                name: "Submissions");

            migrationBuilder.DropTable(
                name: "Topics");

            migrationBuilder.DropTable(
                name: "ReadinessQuizzes");

            migrationBuilder.DropTable(
                name: "Modules");

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_LecturerModuleAssignments_CourseModuleId' AND object_id = OBJECT_ID(N'[LecturerModuleAssignments]'))
    DROP INDEX [IX_LecturerModuleAssignments_CourseModuleId] ON [LecturerModuleAssignments];
");
        }
    }
}
