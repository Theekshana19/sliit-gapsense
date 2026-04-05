# Sewwandi UI Import Report

**Branch:** `integration/system-integration`  
**Source compared:** local `Sewwandi` (same as `origin/Sewwandi`)  
**Date:** 2026-04-05  

## Short audit summary

- **Missing Member 1 pages (before import):** All ten curriculum management UIs existed on Sewwandi but **not** on integration (integration only had `pages/management/curriculum` aggregate page).
- **Missing Member 2 pages (before import):** All seven readiness/quiz UIs were **only** on Sewwandi.
- **Possible conflicts avoided:** Did **not** checkout Sewwandi `sidebar`, `top-bar`, or `status-badge` (integration uses role-based shell + different `app-status-badge` for risk thresholds). Resolved via **`MemberShellComponent`**, **`PillBadgeComponent`**, **`CurriculumOverlayModalComponent`**, and optional **`icon`** on shared `EmptyStateComponent`.
- **Safe paths restored from Sewwandi:** `pages/curriculum/**`, `pages/readiness/**`, `components/curriculum/**`, `components/readiness/**`, `models/curriculum/**`, `models/readiness/**`, `curriculum.service.ts`, `readiness.service.ts`, `components/ui/{confirm-dialog,loading-spinner,search-bar,toast}`, `services/toast.service.ts`, `components/layout/assessment-layout` (quiz attempt).

## 1. Member 1 pages found on Sewwandi

| Spec name | Sewwandi route (pre-integration) | Integration route (after) |
|-----------|-----------------------------------|---------------------------|
| Module Management | `curriculum/module-management` | `/curriculum/module-management` |
| Add edit module | `curriculum/modules/new`, `curriculum/modules/:id/edit` | same |
| Topic Managemnet | `curriculum/modules/:moduleId/topics` | same |
| Add Edit Topic | `curriculum/topics/new`, `curriculum/topics/:id/edit` | same |
| Prerequisite mapping | `curriculum/prerequisite-mapping` | same |
| Add Edit Prerequisite Mapping | `curriculum/prerequisite-management` | same |
| Dependency Visualization | `curriculum/dependency-visualization` | same |
| Topic Weight Configuration | `curriculum/topic-weight-config/:moduleId` | same |
| Semester Module Offerings | `curriculum/semester-offerings` | same |
| Validation Alerts | `curriculum/validation-alerts` | same |

## 2. Member 2 pages found on Sewwandi

| Spec name | Sewwandi route | Integration route (after) |
|-----------|----------------|---------------------------|
| Question_Bank 1 | `readiness/question-bank` | `/readiness/question-bank` |
| Add edit questions page | `readiness/questions/new`, `readiness/questions/:id/edit` | same |
| Quiz Builder | `readiness/quiz-builder` | same |
| quiz scedulling | `readiness/quiz-scheduling` | same |
| Student Assessment | *(no separate page on Sewwandi)* | Menu maps to **`/readiness/submission-tracking`** (same as submission Tracking) |
| submission Tracking | `readiness/submission-tracking` | same |
| Attempt History | `readiness/attempt-history` | same |
| *(student quiz UI)* | `readiness/quiz-attempt/:id` | `/readiness/quiz-attempt/:id` (uses `AssessmentLayoutComponent`) |

## 3. Already in integration vs newly imported

- **Already present:** Auth, dashboard, risk-analysis pages, `management/curriculum` (optional-modules API page), existing layout (`top-bar` / `sidebar` role version).
- **Newly imported from Sewwandi:** All files under the “Safe paths restored” list above; curriculum/readiness pages and their forms; services `curriculum.service.ts`, `readiness.service.ts`, `toast.service.ts`; supporting UI (`confirm-dialog`, `loading-spinner`, `search-bar`, `toast`, `assessment-layout`).
- **Newly added in integration (not on Sewwandi):** `components/layout/member-shell`, `components/ui/pill-badge`, `components/ui/curriculum-overlay-modal`, `config/navigation.config.ts`, `pages/shell/backend-pending-page.component.ts`.

## 4. Still missing (vs ideal product)

- **Dedicated “Student Assessment” screen** distinct from submission tracking: Sewwandi did not define a separate page; both menu labels point to **`/readiness/submission-tracking`**.
- **Topic Weight Configuration** menu entry points to **`/curriculum/module-management`** (entry point to pick a module); deep link still **`/curriculum/topic-weight-config/:moduleId`**.
- **Topic Managemnet** menu entry also uses **`/curriculum/module-management`** (topics are opened per module from there).
- **Backend alignment:** `CurriculumService` / `ReadinessService` still call Sewwandi-style paths (e.g. `/api/modules`, questions, quizzes). Integration API uses `https://localhost:7277` via `API_BASE_URL` (replaced hardcoded `http://localhost:5172`). **Endpoint shapes may not match** until a dedicated integration pass—no mock data was added.

## 5. Duplicate / overlapping routes (intentional)

| Item | Detail |
|------|--------|
| Student Assessment vs submission Tracking | Same URL: `/readiness/submission-tracking` (two sidebar labels). |
| Optional curriculum admin page | **`/curriculum/lecturer-assignment`** — former single `/curriculum` management page (modules/assignments/interventions). |
| Create New Assignment | **`/curriculum/create-assignment`** — placeholder until a dedicated flow exists (separate from lecturer-assignment page). |

## 6. Route mapping (full list added or changed)

| Path | Guard | Component / behavior |
|------|--------|----------------------|
| `/dashboard` | Auth + all roles | Shared dashboard |
| `/curriculum` | Admin | Redirect → `module-management` |
| `/curriculum/lecturer-assignment` | Admin | Existing `CurriculumPageComponent` |
| `/curriculum/create-assignment` | Admin | `BackendPendingPageComponent` |
| `/curriculum/module-management` | Admin | `ModuleManagementComponent` |
| `/curriculum/modules/new`, `/curriculum/modules/:id/edit` | Admin | `AddEditModuleComponent` |
| `/curriculum/modules/:moduleId/topics` | Admin | `TopicManagementComponent` |
| `/curriculum/topics/new`, `/curriculum/topics/:id/edit` | Admin | `AddEditTopicComponent` |
| `/curriculum/topic-weight-config/:moduleId` | Admin | `TopicWeightConfigComponent` |
| `/curriculum/prerequisite-mapping` | Admin | `PrerequisiteMappingComponent` |
| `/curriculum/prerequisite-management` | Admin | `PrerequisiteManagementComponent` |
| `/curriculum/dependency-visualization` | Admin | `DependencyVisualizationComponent` |
| `/curriculum/semester-offerings` | Admin | `SemesterOfferingsComponent` |
| `/curriculum/validation-alerts` | Admin | `ValidationAlertsComponent` |
| `/readiness` | Auth | Redirect → `question-bank` |
| `/readiness/question-bank` | Admin + lecturer | `QuestionBankComponent` |
| `/readiness/questions/new`, `.../:id/edit` | Admin + lecturer | `AddEditQuestionComponent` |
| `/readiness/quiz-builder` | Admin + lecturer | `QuizBuilderComponent` |
| `/readiness/quiz-scheduling` | Admin + lecturer | `QuizSchedulingComponent` |
| `/readiness/quiz-attempt/:id` | Lecturer + student | `QuizAttemptComponent` |
| `/readiness/submission-tracking` | Admin + lecturer | `SubmissionTrackingComponent` |
| `/readiness/attempt-history` | Admin + lecturer | `AttemptHistoryComponent` |
| `/reports-export` | Admin | Placeholder |
| `/notification-center` | Admin | Placeholder |
| `/follow-up-management` | Lecturer | Placeholder |
| `/high-risk-monitoring` | Lecturer | Placeholder |
| `/student-profile` | Lecturer + student | Unchanged component; guard widened for lecturers |

## 7. Role-based menu mapping

**Source file:** `frontend/gapsense-ui/src/app/config/navigation.config.ts` (`SIDEBAR_NAV_ITEMS` + `sidebarItemsForRole`).

- **Admin:** Dashboard, all Member 1 curriculum links, Risk Threshold Management, Recommendation Rule Management, Reports and Export, Notification Center, Lecturer Module Assignment, Create New Assignment.
- **Lecturer:** Dashboard, all Member 2 readiness links, Readiness Result, Weak Topic analytics, recommendation page, Student Readiness Profile, High risk monitoring (placeholder), Follow-Up (placeholder).
- **Student:** Dashboard, Readiness Result, Student Readiness Profile, Personalized Learning Path, Personalized Recommendations, Reassessment comparison.

Sidebar template: `sidebar.component.html` renders **`navItems()`** only (no hardcoded per-role HTML).

## 8. Compile issues fixed

- **`EmptyStateComponent` import** in `question-bank.ts`: path corrected to `empty-state.component`.
- **Selector clash `app-status-badge`:** Sewwandi usage moved to **`app-pill-badge`** (`PillBadgeComponent`); risk threshold table keeps **`app-status-badge`**.
- **Modal clash:** Semester offerings use **`app-curriculum-overlay-modal`** instead of overwriting confirm-style **`app-modal`**.
- **`MainLayoutComponent`:** Replaced with **`MemberShellComponent`** (integration `app-top-bar` + `app-sidebar`).
- **`curriculum.service` / `readiness.service`:** Base URL uses **`API_BASE_URL`** (`https://localhost:7277`).
- **Global toasts:** `<app-toast />` added to `app.html`; `ToastComponent` imported in `app.ts`.

**Build:** `npm run build` succeeds.

## 9. Unresolved / follow-up

- Align **CurriculumService** / **ReadinessService** HTTP paths and DTOs with **GapSense.API** controllers (e.g. `CourseModules`, `Quizzes`)—may require backend or adapter layer.
- Replace **placeholder** routes with real **Reports**, **Notifications**, **Follow-up**, **High-risk monitoring** UIs when available.
- **Admin** can open **readiness** quiz authoring routes (`ADMIN_AND_LECTURER_ROLES`); confirm product intent.

## 10. Completion estimate (integration branch)

| Area | UI in repo | Routed + menu | Notes |
|------|------------|---------------|--------|
| **Member 1** | ~**95%** | ~**95%** | Several menu items share entry URLs; API contract unverified. |
| **Member 2** | ~**90%** | ~**90%** | “Student Assessment” not a distinct page on Sewwandi; quiz attempt route exists for takers. |

---

*Generated as part of Sewwandi → integration UI import and navigation wiring.*
