# STEP 4 — Full flow verification

This document records what was implemented and how to validate it locally. SQL Server was not reachable from the automation environment (`sqlcmd` unavailable, API on `localhost:5292` not running), so **database row counts and live API JSON** should be confirmed on your machine using the commands below.

## 1. Second attempt data (Phase A)

### What was wrong

Student analytics (`StudentAnalyticsService`) previously read only **`QuizAttempts`** (legacy simple quizzes). Readiness flow writes **`Submissions`** + **`SubmissionAnswers`** via `POST /api/submissions`. A second **submission** therefore did not improve reassessment, risk trends, or weak-topic inputs that depended on attempt history.

### What was fixed (backend)

`StudentAnalyticsService` now builds a **unified chronological attempt list** from:

- `QuizAttempts` (unchanged), and  
- `Submissions` for the current user’s **`StudentProfiles.StudentId`**, with topic scores derived from answers, `QuizQuestions` marks, and `Questions` → `Topics`.

Methods updated to use unified attempts:

- `GetReassessmentComparisonAsync`
- `GetRiskTrendsAsync`
- `LoadTopicScoresAsync` (weak topics, recommendations, learning path)
- `GetStudentReadinessProfileAsync` (additional rows from `Submissions`)

### How you create and verify the second submission

1. **Ensure `MaxAttempts` ≥ 2** on the readiness quiz (`ReadinessQuizzes.MaxAttempts`). A helper script is at `scripts/step4-second-submission.sql` (set `@QuizId` / `@StudentRegId` or run your own `UPDATE`).
2. **Authenticate** as the student (`POST /api/auth/login`) and note the JWT and the profile’s `studentId` (registration id) used by submissions.
3. **First vs second attempt**: call `POST /api/submissions` with the same `quizId` and `studentId`, but **different** `selectedOptionId` values so `Score` / `Percentage` change. Body shape: `CreateSubmissionDto` (`quizId`, `studentId`, `studentName`, `answers[]`).
4. **Verify SQL**:

```sql
SELECT QuizId, StudentId, AttemptNumber, Score, TotalMarks, Percentage, SubmittedAt
FROM Submissions
WHERE StudentId = @RegId AND QuizId = @QuizId
ORDER BY AttemptNumber;
```

```sql
SELECT COUNT(*) FROM SubmissionAnswers WHERE SubmissionId IN (
  SELECT Id FROM Submissions WHERE StudentId = @RegId AND QuizId = @QuizId
);
```

## 2. Analytics after the second attempt (Phase B)

Call as the **same student** (Bearer token):

```http
GET /api/student-analytics/reassessment
GET /api/student-analytics/readiness-profile
GET /api/student-analytics/risk-trends
```

### Expected improvements

| Endpoint | Before (single readiness source) | After (with merged submissions) |
|----------|-----------------------------------|-----------------------------------|
| `reassessment` | Empty or “same attempt both columns” if only `Submissions` existed | **Latest vs previous** unified attempt; delta message uses score difference; topic rows from submission topic aggregation when present |
| `readiness-profile` | Mostly readiness / legacy attempts | **Extra rows** for each graded/submitted readiness **submission** |
| `risk-trends` | Weak progression if only submissions | **Points** include submission months; “Attempts tracked” uses unified count |

**Print differences**: compare `attempt1Score.scorePercent` vs `reassessmentScore.scorePercent`, `improvementDelta.message`, and `riskProgression.currentCohortPoints` before and after the second `POST /api/submissions`.

## 3. Monitoring / interventions (Phase C)

| Piece | Route / table | Status |
|-------|----------------|--------|
| API | `GET/POST /api/StudentInterventions` (`StudentInterventionsController`) | Implemented; POST requires **admin** or **lecturer** |
| Persistence | `StudentInterventions` table via `OptionalModulesService.CreateStudentInterventionAsync` | Implemented |

**High-risk identification**: driven off real scores (e.g. reassessment / submission percentages &lt; 40). Staff can create an intervention for a **`studentUserId`** (the auth user id GUID) after identifying the student from readiness/submission tools.

**Gap**: There is **no dedicated “high-risk student list”** API; lecturers/admins use existing readiness results, submissions, and analytics screens plus manual intervention creation.

## 4. Role-based dashboards (Phase D)

| Role | Behaviour |
|------|------------|
| **Student** | `/dashboard` loads **quiz schedules** from `ReadinessService.getSchedules()` (existing). Sidebar routes guarded per `app.routes.ts` + `roleGuard`. |
| **Admin / Lecturer** | `/dashboard` now loads a **live summary** via `CourseModules`, `Submissions` stats, `StudentInterventions`, and (lecturers only) `LecturerAssignments`. No hardcoded KPI integers. |
| **Menus** | Still defined in `navigation.config.ts` + `roleGuard`; no structural change. |

## 5. Mock / static data removal (Phase E)

Removed or replaced **data** mocks in:

- `reassessment-comparison.service.ts`, `risk-trends-summary.service.ts`, `personalized-learning-path.service.ts`, `personalized-recommendations.service.ts`
- `weak-topic-analysis.service.ts` (module list from **`/api/CourseModules`**; analysis from **`/api/student-analytics/weak-topics`**)
- `student-readiness-profile.service.ts` (profile built only from **`/api/student-analytics/readiness-profile`**)
- `notification.service.ts` (starts **empty** until a notifications API exists)
- `recommendation-rule.service.ts` (summary metrics derived **only** from loaded rules)

User-facing toasts that literally said “mock” were reworded in a few pages (reports, security, overview, monitoring plans).

**Remaining**: comments in some `*.model.ts` files still mention “mock” in documentation strings only; no runtime mock payloads there.

## 6. Remaining backend gaps (if any)

- **Notifications**: no REST controller; UI list is empty by design.
- **PDF / certificate / report export**: UI placeholders only; no export endpoints wired.
- **Institutional risk cohort charts** (compare cohorts): student `risk-trends` endpoint is **scoped to the signed-in user**; multi-student cohort analytics would need new APIs.

## 7. Automation note

Local verification commands were **not executed against a live SQL/API** in this environment. After `dotnet run` (API) and `npm start` (UI), run the HTTP calls above with a real student token to complete Phase B numeric confirmation.
