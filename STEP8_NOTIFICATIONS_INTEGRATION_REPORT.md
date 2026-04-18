# Step 8 — Notification center (real backend)

Date: 2026-04-18  
Branch: `integration/system-integration`

## Phase A — Before

| Item | Detail |
|------|--------|
| Route | `/notifications` (shell under Tharindu layout) |
| Component | `frontend/gapsense-ui/src/app/pages/notifications/notifications-page.component.ts` (+ `notification-item`, `notification-bell`, `notification-dropdown`) |
| Service | `NotificationService` — in-memory **empty** `signal([])`; `markAsRead` only toggled local state |
| Data | No server feed; no persistence |
| UI | Title, message, type (risk/academic/reminder/system), read dot, time string; filters; mark all read; clear all |
| Backend | **None** for notifications |

## Phase B — Backend design (minimal)

- **Entity** `UserNotification` → table **`UserNotifications`**: `Id`, `UserId`, `Title`, `Message`, `Type` (`risk` \| `academic` \| `reminder` \| `system`), `IsRead`, `CreatedAtUtc`.
- **EF** configuration + migration `20260418120000_AddUserNotifications`.
- **`INotificationService`** / **`UserNotificationService`**: list for user, mark one read, mark all read, delete all for user, create row.
- **`NotificationsController`** (`[Authorize]`):
  - `GET /api/Notifications`
  - `PATCH /api/Notifications/{id}/read`
  - `PATCH /api/Notifications/mark-all-read`
  - `DELETE /api/Notifications` (clear all for current user — supports existing **Clear all** button)

## Phase C — Frontend

- **`notification.service.ts`**: `HttpClient` → above APIs; `refresh()` loads list; maps DTO → existing `NotificationItem`; **no** mock arrays.
- **`notifications-page`**: `ngOnInit` → `refresh()`.
- **`notification-bell`**: refresh on init and when opening dropdown.
- **`notification-item`**, **dropdown**: async mark-as-read / mark-all via service.

## Phase D — Event hooks (practical, small)

In **`OptionalModulesService`** after successful **create** / **patch** of `StudentInterventions`:

- Notify **`StudentUserId`** with in-app rows (**academic** on create, **system** on status update).
- Wrapped in **try/catch** so notification failures never fail the intervention transaction.

**Not implemented (documented next hooks):** quiz schedule published, high-risk analytics, lecturer copy on intervention (would need routing rules).

## Phase E — Verification

- `dotnet build` (API solution) — passed.
- `npm run build` — passed.
- Manual: run API (migrations apply in Development), log in, open **Notifications**; create/patch intervention as staff → student sees new rows; mark read / mark all / clear; reload page → state matches DB.

## Phase F — Remaining gaps

1. **Reports / Export**: still need export jobs, file storage, and/or analytics-backed report definitions — unrelated to this notification store.
2. **Rich notification model**: no deep links, payload JSON, or deduplication.
3. **Lecturer/admin copies** of intervention events: only the **student** is notified today.
4. **Real-time**: no SignalR; user refreshes or re-opens bell to load latest.
