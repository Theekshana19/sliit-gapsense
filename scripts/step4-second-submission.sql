-- STEP 4 Phase A: allow a second readiness attempt and optionally bump MaxAttempts on a quiz.
-- Run against GapSenseDb after identifying @QuizId and @StudentRegId from your environment.
-- Example discovery:
--   SELECT TOP 5 Id, Title, MaxAttempts FROM ReadinessQuizzes ORDER BY CreatedAt DESC;
--   SELECT TOP 5 UserId, StudentId FROM StudentProfiles;

DECLARE @QuizId UNIQUEIDENTIFIER = NULL; -- set e.g. 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
DECLARE @StudentRegId NVARCHAR(20) = NULL; -- set to StudentProfiles.StudentId (matches Submissions.StudentId)

IF @QuizId IS NOT NULL
  UPDATE ReadinessQuizzes SET MaxAttempts = 3 WHERE Id = @QuizId AND MaxAttempts < 2;

-- Inspect existing attempts before inserting a second submission via API:
-- SELECT Id, QuizId, StudentId, AttemptNumber, Score, TotalMarks, Percentage, SubmittedAt FROM Submissions WHERE QuizId = @QuizId AND StudentId = @StudentRegId ORDER BY AttemptNumber;
