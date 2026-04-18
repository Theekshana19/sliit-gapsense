# Step 7 — Follow-up management (real data)

Date: 2026-04-18  
Branch: `integration/system-integration`

## Phase A — Audit (before)

| Item | Detail |
|------|--------|
| Route | `/monitoring/follow-ups` (alias redirect: `/follow-up-management`) |
| Component | `frontend/gapsense-ui/src/app/pages/monitoring/follow-ups/follow-ups.component.ts` |
| Service | None — all data inline |
| Data source | Hardcoded `followUps` (4 demo rows with external avatar URLs), `lecturerNotes`, static KPIs (12 / 28), fake module/status filter options, footer “4 of 86” |
| UI fields | Student display, module, intervention chip, follow-up dates, row status (overdue/pending/completed), action buttons (non-functional) |
| Backend | `StudentInterventions`: `Id`, `StudentUserId`, `CreatedByUserId`, `Title`, `Notes`, `Status` (`open` \| `closed`), `CreatedAtUtc` — **no update endpoint** before this step |

## Phase B–D — After

### Backend (minimal)

- **`PatchStudentInterventionRequest`** (`Status?`, `Notes?`) in `OptionalModulesDtos.cs`.
- **`IOptionalModulesService.PatchStudentInterventionAsync`**
- **`OptionalModulesService`**: load tracked entity by id; validate status if provided; update notes if property provided (null/whitespace → `NULL` in DB); students may only touch own row (for future use); **HTTP PATCH** `[Authorize(Roles = "admin,lecturer")]`.
- **`PATCH /api/StudentInterventions/{id}`** on `StudentInterventionsController`.

### Frontend

- **`optional-modules-api.service.ts`**: `patchStudentIntervention(id, body)`.
- **`follow-up-interventions.service.ts`** (new): `loadAll()` → maps `GET` interventions + `CourseModules` to existing table row shape; parses **Step 6 JSON `Notes` v1** for module, due date, intervention type; `buildNoteFeed()` builds “recent notes” from real `Notes`/`Title`; `patch()` delegates to API.
- **`follow-ups.component.ts`**: loads on init; filters (search / module / status) client-side; **status** button → confirm → `PATCH` status; **notes** button → `prompt` → `PATCH` notes; **reload** after success; KPI cards and footer counts from **live rows**; sidebar trend replaced with **non-mock** copy referencing API; no hardcoded student rows.

### Mock logic removed

- Demo `followUps` / `lecturerNotes` arrays, fake counts, fake filter `<option>`s, “4 of 86”, external stock avatars (replaced with inline SVG placeholder).

## DB / API verification

| Action | API |
|--------|-----|
| List | `GET /api/StudentInterventions` (+ `GET /api/CourseModules` for module titles) |
| Update status | `PATCH /api/StudentInterventions/{id}` body `{ "status": "open" \| "closed" }` |
| Update notes | `PATCH /api/StudentInterventions/{id}` body `{ "notes": "..." }` |

DB columns touched on update: **`Status`**, **`Notes`** (JSON metadata from Step 6 preserved if the user does not change structure).

## Phase E — How to verify manually

1. Log in as **admin** or **lecturer** → open **Follow-up Management**.
2. Confirm table matches DB / `GET /api/StudentInterventions`.
3. **Close**: open row → check-circle → confirm → refresh → row **closed** (completed pill).
4. **Reopen**: closed row → history → confirm → refresh → **open** again.
5. **Notes**: sticky note → edit in prompt → save → refresh → **Notes** column source updated in DB.
6. Search / module / status filters change visible rows without mock data.

## Remaining gaps

1. **No delete** for interventions (unchanged).
2. **Student display name** not in API — UI shows `Student {short}` + full GUID.
3. **Notes editing** uses `window.prompt` (minimal, not a full editor).
4. **Pagination** buttons remain disabled (no paging API).
5. **Reports / Notifications** still blocked: no persisted **notification** feed or **report/export job** tables/APIs in this change — reports need analytics/export pipeline; notifications need a **Notifications** store + `GET` API.
