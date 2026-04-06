using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GapSense.Infrastructure.Migrations
{
    /// <inheritdoc />
    /// <summary>
    /// Fixes DBs where QuizQuestions.QuizId still references LegacyQuizzes/Quizzes.
    /// Readiness quizzes are stored in ReadinessQuizzes; EF expects FK_QuizQuestions_ReadinessQuizzes_QuizId.
    /// </summary>
    public partial class FixQuizQuestionsFkToReadinessQuizzes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF OBJECT_ID(N'[QuizQuestions]', N'U') IS NULL OR OBJECT_ID(N'[ReadinessQuizzes]', N'U') IS NULL
    RETURN;

-- Drop legacy FKs (names differ by migration / rename history)
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_QuizQuestions_Quizzes_QuizId' AND parent_object_id = OBJECT_ID(N'[QuizQuestions]'))
    ALTER TABLE [QuizQuestions] DROP CONSTRAINT [FK_QuizQuestions_Quizzes_QuizId];

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_QuizQuestions_LegacyQuizzes_QuizId' AND parent_object_id = OBJECT_ID(N'[QuizQuestions]'))
    ALTER TABLE [QuizQuestions] DROP CONSTRAINT [FK_QuizQuestions_LegacyQuizzes_QuizId];

-- Any remaining FK on QuizId pointing at old quiz tables
DECLARE @fk sysname;
DECLARE c CURSOR LOCAL FAST_FORWARD FOR
    SELECT fk.name
    FROM sys.foreign_keys fk
    INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    INNER JOIN sys.tables rt ON fk.referenced_object_id = rt.object_id
    WHERE fk.parent_object_id = OBJECT_ID(N'[QuizQuestions]')
      AND COL_NAME(fkc.parent_object_id, fkc.parent_column_id) = N'QuizId'
      AND rt.name IN (N'LegacyQuizzes', N'Quizzes');

OPEN c;
FETCH NEXT FROM c INTO @fk;
WHILE @@FETCH_STATUS = 0
BEGIN
    EXEC(N'ALTER TABLE [QuizQuestions] DROP CONSTRAINT [' + @fk + N'];');
    FETCH NEXT FROM c INTO @fk;
END;
CLOSE c;
DEALLOCATE c;

-- Orphan rows cannot reference ReadinessQuizzes after retargeting
DELETE qq
FROM [QuizQuestions] AS qq
LEFT JOIN [ReadinessQuizzes] AS rq ON qq.[QuizId] = rq.[Id]
WHERE rq.[Id] IS NULL;

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_QuizQuestions_ReadinessQuizzes_QuizId'
      AND parent_object_id = OBJECT_ID(N'[QuizQuestions]'))
BEGIN
    ALTER TABLE [QuizQuestions] ADD CONSTRAINT [FK_QuizQuestions_ReadinessQuizzes_QuizId]
        FOREIGN KEY ([QuizId]) REFERENCES [ReadinessQuizzes] ([Id]) ON DELETE CASCADE;
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Forward-only: reverting would require knowing whether rows pointed at Legacy vs Readiness.
        }
    }
}
