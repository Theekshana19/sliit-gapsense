# Step 9 — Reports & Export (Real Data)

## Before vs after

| Area | Before | After |
|------|--------|--------|
| Data | Static rows, fake counts, placeholder “export not connected” messaging | Live `CourseModules`, `StudentInterventions`, and `student-analytics` weak topics + risk trends |
| Table | Hardcoded “recent exports” style rows | **Intervention snapshot** from `/api/StudentInterventions`, module label from Step 6 JSON in `notes` (`v:1`, `moduleCode`) |
| Parameters | Hardcoded batch / semester / module lists | Module dropdown from API; batch/semester fixed to **all** (no fake cohorts) |
| Export | Mock toast | **CSV** built in the browser from current snapshot; optional weak-topic summary appendix; PDF shows a short “not available” toast (no PDF engine) |

## Route and component

- **Route:** `/risk-analysis/reports` (alias redirect: `/reports-export` → same)
- **Component:** `frontend/gapsense-ui/src/app/pages/risk-analysis/reports/reports.component.ts` (`RiskReportsPageComponent`, inline template)

## Data sources used

| Purpose | Client service | HTTP API |
|---------|------------------|-----------|
| Module list | `OptionalModulesApiService.fetchCourseModules()` | `GET .../api/CourseModules` |
| Interventions (table + CSV rows) | `OptionalModulesApiService.fetchInterventions()` | `GET .../api/StudentInterventions` |
| Weak topics (optional CSV appendix + context) | `StudentAnalyticsApiService.fetchWeakTopics(moduleCode?)` | `GET /api/student-analytics/weak-topics?moduleCode=` (optional query) |
| Risk trends (sidebar summary line) | `StudentAnalyticsApiService.fetchRiskTrends()` | `GET /api/student-analytics/risk-trends` |

Orchestration: `ReportsSnapshotService` (`frontend/gapsense-ui/src/app/services/reports-snapshot.service.ts`) loads the four sources in parallel and maps interventions to table rows and CSV.

**New backend endpoints:** none (Step 9 stayed frontend-only).

## Export functionality

- **Format:** CSV (`text/csv`), generated in the browser via `Blob` + object URL.
- **Intervention rows:** columns `studentUserId`, `module`, `riskLevel`, `readinessScore`, `interventionStatus`.
  - `module` is resolved from intervention `notes` JSON (`moduleCode`) when present, else raw code or empty.
  - `riskLevel` and `readinessScore` are left empty in CSV because the backend does not attach per-intervention readiness/risk on this DTO; computing them here would duplicate analytics logic.
  - `interventionStatus` uses the API `status` field (normalized to lowercase in CSV).
- **Weak topic appendix:** when weak-topic analytics returns data, the CSV appends comment/summary lines (`totalTopicsEvaluated`, `weakTopicsIdentified`, `criticalWeakAreas`) for the selected module filter.
- **Per-row download:** single intervention row as a one-line CSV.
- **PDF:** not implemented (toast only).

## Analytics scope limitation (important)

`StudentAnalyticsController` resolves analytics for the **authenticated user** (JWT). The Reports page is available to **admin/lecturer** roles, but **weak topics** and **risk trends** still describe the **signed-in user**, not an arbitrary student or whole cohort, unless the API is extended later. **Interventions** are the primary multi-row, staff-relevant dataset for this page.

## System completeness status

- **Done for Step 9:** Reports page uses real APIs; no mock intervention rows; CSV export works; Angular `ng build` succeeds.
- **Remaining gaps (system-wide):**
  - Org-wide or per-student reports need backend support (e.g. lecturer/admin analytics by `studentUserId` or cohort).
  - CSV could include risk/readiness when the API exposes them on interventions or a dedicated report DTO.
  - “Recent Exports” is still a non-functional shell button (no redesign requested).
  - PDF export not implemented.

## Manual test steps

1. Sign in as a user with access to **Reports** (`/risk-analysis/reports`).
2. Confirm the **module** dropdown lists real modules from the API.
3. Confirm the **Intervention snapshot** table lists rows consistent with **Interventions** elsewhere (same API).
4. Change **module** filter and confirm reload (weak-topic appendix reflects filter when data exists).
5. Click **Generate Report (CSV)** with a module selected: file downloads; open in Excel and verify headers and intervention rows.
6. Click row **Download**: single-row CSV downloads.
7. Optional: compare intervention count on this page with the interventions module for the same account.
