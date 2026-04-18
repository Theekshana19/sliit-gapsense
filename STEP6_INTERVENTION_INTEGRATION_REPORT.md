# Step 6 — Intervention planning + add intervention plan

Date: 2026-04-18  
Branch: `integration/system-integration`

## Phase A — Audit (before change)

| Item | Detail |
|------|--------|
| **Routes** | `/monitoring/plans` (Intervention Planning), `/monitoring/intervention-plan` (Add plan) |
| **Components** | `frontend/gapsense-ui/src/app/pages/monitoring/plans/plans.component.ts`, `.../intervention-plan/intervention-plan.component.ts` |
| **Service used** | `MonitoringService` (in-memory seed + `add` / `remove`) |
| **Mock / seed** | Fixed `seed` array of three fake `InterventionPlan` rows; delete only updated local signal |
| **Backend APIs** | `GET /api/StudentInterventions`, `POST /api/StudentInterventions` (roles admin, lecturer for POST); `GET /api/CourseModules` |
| **DB** | `StudentInterventions` entity (`StudentUserId`, `Title`, `Notes`, `Status` open\|closed, `CreatedAtUtc`, …); `CourseModules` for catalogue |
| **Hardcoded (before)** | Module `<option>` IT1010/IT2020/IT3010; batch/Y1S1-style fake student refs; KPI cards 78.4% / “12 Required” bullets; local-only delete |

## Phase B/C — What changed

### New / updated frontend

- **`student-intervention-plans.service.ts`** (new): loads interventions + modules via `OptionalModulesApiService`, maps `StudentInterventionDto` ↔ `InterventionPlan`, serializes extra wizard fields into **`Notes` JSON** (`v:1`) so module code, risk, type, due date, draft flag, and UI status survive round-trip without backend schema changes.
- **`plans.component.ts`**: loads list from `StudentInterventionPlansService.loadPlans()`; loading/error states; KPI cards use **real open/closed counts** from `apiStatus`; “Remove…” explains **no delete API**.
- **`intervention-plan.component.ts`**: modules from **`GET /api/CourseModules`**; **student user id** is a required **GUID** field (no fake batch list); create uses **`POST /api/StudentInterventions`** with status mapped to server **`open` / `closed`**.
- **`monitoring.model.ts`**: optional `apiStatus?: 'open' | 'closed'` on `InterventionPlan`.
- **`monitoring.service.ts`**: **removed** (seed eliminated).

### API mapping rules

- **Server status**: only `open` and `closed`. UI “Completed” → `closed`; “Scheduled” / “In Progress” (and drafts) → `open`.
- **UI status** (Scheduled vs Active) for open rows: stored as `uiStatus` inside JSON notes so the list can still show three states in the existing pills.
- **Draft**: `isDraft: true` in JSON; row remains `open` on server.

### Hardcoding removed

- Fake module codes and batch options on the add form.
- Fake KPI percentages and bullet lists on the planning page.
- In-memory seed list.

### Isolated gap (documented, not scattered)

- **Student picker**: There is still **no student search/list API** in this slice. The add form uses a **GUID text field** with validation and helper copy pointing to admins copying ids from other tools until a search endpoint exists.

## Phase D — Verification

| Check | How |
|--------|-----|
| Build | `npm run build` in `frontend/gapsense-ui` — **passed** |
| Runtime DB | Not executed in CI here; manual: log in as admin/lecturer → open `/monitoring/plans` → confirm rows match DB / `GET /api/StudentInterventions` |
| Create + refresh | Submit add form → redirect to plans → **reload** should show new row (same GET) |

## Remaining gaps

1. **DELETE / PATCH** `StudentInterventions`: not exposed; “Remove…” is informational only.
2. **Follow-up management** (`/monitoring/follow-ups`): still **static template data**; to go real it needs either **PATCH** (status, due dates, notes) + list from interventions, or a dedicated follow-up entity—**smallest path** is usually **extend optional interventions API** (update status/notes) and bind the existing table to `GET` + map columns.
3. **Legacy rows** created before this change (e.g. from curriculum page with free-text `Notes`): list still renders using **defaults** for risk/type/module when JSON metadata is missing.

## Files touched (this step)

- `frontend/gapsense-ui/src/app/services/student-intervention-plans.service.ts` (new)
- `frontend/gapsense-ui/src/app/pages/monitoring/plans/plans.component.ts`
- `frontend/gapsense-ui/src/app/pages/monitoring/intervention-plan/intervention-plan.component.ts`
- `frontend/gapsense-ui/src/app/models/monitoring/monitoring.model.ts`
- `frontend/gapsense-ui/src/app/services/monitoring.service.ts` (deleted)
- `STEP6_INTERVENTION_INTEGRATION_REPORT.md` (this file)
