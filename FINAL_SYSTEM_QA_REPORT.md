# Final System QA Report — Step 10

**Branch:** `integration/system-integration`  
**Scope:** Role-based flows, routes/guards/menus, real-data posture, remaining gaps.  
**Method:** Static audit of `app.routes.ts`, guards, `navigation.config.ts`, Tharindu shell, and representative pages (no automated E2E in this pass).

---

## 1. Admin flow verification

| Step | Route (primary) | Guard | Notes |
|------|-----------------|-------|--------|
| Login | `/auth/login` | `guestGuard` | OK |
| Dashboard | `/dashboard` | `authGuard` + `ALL_AUTHENTICATED` | Real staff snapshot (modules, submissions stats, interventions). Uses **legacy** `TopBar` + `Sidebar` (`navigation.config`). |
| Module Management | `/curriculum/module-management` | `authGuard` + `ADMIN_ROLES` | OK |
| Topic Management | `/curriculum/modules/:moduleId/topics` | Same parent | OK (deep link from modules) |
| Prerequisite Mapping | `/curriculum/prerequisite-mapping` | Admin | OK |
| Semester Module Offerings | `/curriculum/semester-offerings` | Admin | OK |
| Lecturer Module Assignment | `/curriculum/lecturer-assignment` | Admin | OK |
| Risk Threshold Management | `/risk-thresholds` | Admin | OK |
| Recommendation Rule Management | `/recommendation-rules` (+ add/edit) | Admin | OK |
| Intervention Planning | `/monitoring/plans` (alias `/intervention-planning`) | `ADMIN_AND_LECTURER` + Tharindu shell | OK |
| Follow-Up Management | `/monitoring/follow-ups` (alias `/follow-up-management`) | Staff + Tharindu | OK |
| Reports | `/risk-analysis/reports` | Staff + Tharindu | Real interventions + analytics snapshot; analytics scoped to JWT user (see Step 9 doc). |
| Notifications | `/notifications` | All authenticated + Tharindu | OK |

**Sidebar / shell:** Admin curriculum pages use **Member shell**, not Tharindu. Risk/monitoring/notifications use **Tharindu** with staff nav. No conflict; two navigation systems coexist (documented gap: not unified).

---

## 2. Lecturer flow verification

| Step | Route | Guard | Notes |
|------|-------|-------|--------|
| Login | `/auth/login` | guest | OK |
| Dashboard | `/dashboard` | All authenticated | Staff snapshot + lecturer assignment count when role is lecturer. |
| Question Bank | `/readiness/question-bank` | `ADMIN_AND_LECTURER` | OK |
| Quiz Builder | `/readiness/quiz-builder` | Staff | OK |
| Quiz Scheduling | `/readiness/quiz-scheduling` | Staff | OK |
| Student Assessment / Submission Tracking | `/readiness/submission-tracking` | Staff | OK |
| Attempt History | `/readiness/attempt-history` | `ALL_AUTHENTICATED` | OK |
| Readiness Result | `/readiness-results` | Lecturer + student | API-backed |
| Weak Topic Analysis | `/weak-topic-analysis` | Lecturer + student | API-backed; subject = JWT user |
| Recommendations | `/recommendations` | Lecturer + student | API-backed |
| Follow-Up Management | `/monitoring/follow-ups` | Staff | OK |
| Notifications | `/notifications` | All + Tharindu | OK |

**Fix applied (Step 10):** `navigation.config.ts` — added **Follow-ups** and **Notifications** for lecturer; corrected a few nav labels (typos / naming only).

---

## 3. Student flow verification

| Step | Route | Guard | Notes |
|------|-------|-------|--------|
| Login | `/auth/login` | guest | OK |
| Dashboard / landing | `/dashboard` or post-login `/readiness-results` | `defaultHomeUrlForRole` sends students to **readiness results** | Student **can** open `/dashboard` (allowed); UI shows student quiz list. |
| Readiness Result | `/readiness-results` | Lecturer + student | OK |
| Student Readiness Profile | `/student-profile` | Lecturer + student | OK |
| Personalized Recommendations | `/recommendations` | Lecturer + student | OK |
| Personalized Learning Path | `/learning-path` | **Student only** | Lecturer blocked (by design). |
| Reassessment Comparison | `/reassessment-comparison` | Lecturer + student | OK |
| Risk Trends & Summary | `/risk-trends` | **Student only** | OK |
| Notifications | `/notifications` | All + Tharindu | OK |

**Fix applied (Step 10):**  
- **Tharindu shell sidebar** — students no longer see staff-only links (Interventions, Heatmap, Batch Overview, Reports, New Intervention CTA). They see a short student-safe set: Dashboard, Readiness Result, Readiness quizzes, Notifications, Risk Trends.  
- **Tharindu topbar** — role subtitle shows **Administrator / Lecturer / Student** instead of the previous generic “Academic Registrar” label; avatar uses initials (removed stock photo) for non-dashboard shell pages.  
- **navigation.config** — added student entries: **Weak Topic Analysis**, **Risk Trends & Summary**, **Notifications**; fixed “Reassessment comparison” spelling.

**Student follow-ups:** There is **no** student-scoped follow-up route in `app.routes.ts` (`/monitoring/*` is staff-only). Treat as **product gap**, not a routing bug.

---

## 4. Route + menu + guard audit

### 4.1 Correctly guarded (representative)

- Admin-only: `curriculum/**`, `/risk-thresholds`, `/recommendation-rules*`
- Staff (admin + lecturer): `/monitoring/**`, `/risk-analysis/**` (reports + heatmap), `/readiness/question-bank`, `quiz-builder`, `quiz-scheduling`, `submission-tracking`, `/readiness/overview`
- Student-only: `/readiness/available-quizzes`, `/learning-path`, `/risk-trends`
- Shared: `/dashboard`, `/readiness/attempt-history`, `/notifications`, `/settings`, several analytics pages under `LECTURER_OR_STUDENT_ROLES`

### 4.2 Issues found and addressed (Step 10)

| Issue | Severity | Resolution |
|-------|-----------|------------|
| Tharindu shell showed **same staff nav** on `/notifications` and `/settings` for **students** | UX / perceived access bug | Sidebar filtered by `SessionService` role; student CTA hidden |
| Topbar showed **“Academic Registrar”** for all roles | Incorrect role display | `roleSubtitle()` from `user.role` |
| Lecturer nav missing follow-ups / notifications | Menu completeness | Added to `navigation.config.ts` |
| Student nav missing notifications / risk trends / weak topics | Menu completeness | Added to `navigation.config.ts` |

### 4.3 Remaining structural notes (not “broken”)

- **Two sidebars:** `SidebarComponent` + `navigation.config` (dashboard + flat readiness/risk pages) vs **Tharindu** (monitoring, risk-analysis children, notifications, settings). Items and labels can diverge; staff using only Tharindu may not see every `navigation.config` entry without going through dashboard first.
- **`navigation.config`:** Several admin links still point to `/curriculum/module-management` as a hub (topic weight, topic management) — intentional hub pattern but easy to misread as duplicate entries.
- **Wildcards:** `path: '**'` redirects to login (loses deep links for unauthenticated users — acceptable).

### 4.4 “Wrong role” page access

- After Step 10 fixes, **guards** remain the source of truth; students **cannot** activate staff-only route components, but previously the **shell** suggested staff destinations. **Resolved** for Tharindu student experience.

---

## 5. Pages status table

| Page | Role(s) | Real data status | Route status | Notes |
|------|---------|------------------|----------------|-------|
| Dashboard | All | **Fully real** (staff) / **Fully real** (student schedules) | OK | Dual UI by role |
| Curriculum (modules, topics, prerequisites, offerings, lecturer assignment) | Admin | **Fully real** (API) | OK | Member shell |
| Risk thresholds | Admin | **Fully real** | OK | |
| Recommendation rules | Admin | **Fully real** | OK | |
| Readiness overview | Admin, Lecturer | Depends on backend | OK | Tharindu child |
| Question bank / quiz builder / scheduling / submission tracking | Admin, Lecturer | **Real but partial** if DB sparse | OK | |
| Quiz attempt | Lecturer, Student | Real | OK | |
| Attempt history | All | Real (empty if no attempts) | OK | |
| Readiness result | Lecturer, Student | **Real** | OK | |
| Student readiness profile | Lecturer, Student | **Real** | OK | Scoped to JWT user |
| Personalized recommendations | Lecturer, Student | **Real** | OK | Scoped |
| Learning path | Student | **Real** | OK | |
| Reassessment comparison | Lecturer, Student | **Real** | OK | Scoped |
| Risk trends summary | Student | **Real** | OK | Scoped |
| Weak topic analysis | Lecturer, Student | **Real** | OK | Scoped |
| Monitoring plans / intervention plan / follow-ups | Admin, Lecturer | **Real** | OK | |
| Reports & export | Admin, Lecturer | **Real but partial** | OK | Interventions real; risk/readiness CSV columns empty; analytics rows = current user |
| Notifications | All | **Real** | OK | |
| Settings | All | Mostly UI / **real but partial** (logout note in service) | OK | |
| **High-risk heatmap** | Admin, Lecturer | **Still mock / static** | OK route | KPIs, queue, charts hardcoded in component — **main demo gap** |
| Profile | All | Real API | OK | |

---

## 6. Final remaining gaps

### 6.1 Critical blockers (for a “100% real analytics” story)

1. **High-risk heatmap** (`/risk-analysis/heatmap`) — entirely static demo data; does not call analytics or interventions APIs.

### 6.2 Minor backend gaps

- Analytics and several risk pages are **scoped to the authenticated user**, not arbitrary students or cohorts (reports, weak topics, trends, etc.).
- No **student** API for “my follow-ups” if product expects parity with lecturer follow-ups.

### 6.3 Minor frontend gaps

- **Recent Exports** on Reports page is a non-functional control (shell only).
- **Dual navigation** (Member shell vs legacy sidebar vs Tharindu) — cognitive overhead for viva, not a functional blocker.
- **`navigation.config`** still has overlapping admin entries (multiple links to module hub).

### 6.4 Nice-to-have (post-viva)

- PDF export on heatmap / reports.
- Unified shell across all post-login pages.
- Backend-driven cohort analytics for heatmap and reports.

---

## 7. Viva-ready status summary

| Criterion | Status |
|-----------|--------|
| Auth + role guards | **Strong** — `authGuard`, `roleGuard`, sensible `defaultHomeUrlForRole` |
| Core curriculum + readiness authoring | **Strong** — real APIs |
| Interventions + follow-ups + notifications | **Strong** |
| Student learning analytics pages | **Strong** — wired to `/api/student-analytics/*` |
| Institutional “heatmap / queue” story | **Weak** — mock page until wired |
| Single navigation story | **Moderate** — three layout patterns |

**Conclusion:** The system is **suitable for a viva demo** if the narrative centers on **login → role-specific dashboard → readiness/quiz flow → student analytics → interventions/notifications**, and the heatmap is either **not shown** or explicitly called a **UI placeholder** until backend wiring is prioritized.

---

## 8. Change log (this QA step)

| File | Change |
|------|--------|
| `frontend/gapsense-ui/src/app/components/layout/tharindu-shell/tharindu-sidebar.component.ts` | Role-based main links; hide New Intervention CTA for students |
| `frontend/gapsense-ui/src/app/components/layout/tharindu-shell/tharindu-topbar.component.ts` | Role-accurate subtitle; initials avatar on shell pages |
| `frontend/gapsense-ui/src/app/config/navigation.config.ts` | Lecturer + student nav additions; label typo fixes |
| `FINAL_SYSTEM_QA_REPORT.md` | This document |

**Build:** `npm run build` (frontend) — **pass** after the above edits.
