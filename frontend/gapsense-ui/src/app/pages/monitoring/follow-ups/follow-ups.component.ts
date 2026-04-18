import { NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmService } from '../../../components/ui/confirm-dialog/confirm.service';
import { ToastService } from '../../../components/ui/toast/toast.service';
import type { FollowUpNoteFeedItem, FollowUpRow } from '../../../services/follow-up-interventions.service';
import { FollowUpInterventionsService } from '../../../services/follow-up-interventions.service';
import { TABLE_FILTER_MAX_LENGTH } from '../../../validators/form-utils';

@Component({
  standalone: true,
  selector: 'app-follow-ups-page',
  imports: [NgClass, FormsModule],
  template: `
    <div class="mx-auto max-w-7xl space-y-0 pb-12 font-body text-on-surface">
      <header class="mb-8 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div class="max-w-xl">
          <h1 class="mb-2 font-headline text-3xl font-extrabold tracking-tight text-[#003f87]">Follow-up Management</h1>
          <p class="text-on-surface-variant">Track and manage academic interventions for high-risk cohorts.</p>
        </div>
        <div class="flex shrink-0 gap-4">
          <div
            class="min-w-[148px] rounded-xl border-l-4 border-error bg-white py-4 pl-4 pr-5 shadow-sm"
          >
            <span class="mb-1 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Overdue</span>
            <span class="font-headline text-3xl font-extrabold text-error">{{ overdueCount() }}</span>
          </div>
          <div
            class="min-w-[148px] rounded-xl border-l-4 border-[#003f87] bg-white py-4 pl-4 pr-5 shadow-sm"
          >
            <span class="mb-1 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Pending</span>
            <span class="font-headline text-3xl font-extrabold text-[#003f87]">{{ pendingCount() }}</span>
          </div>
        </div>
      </header>

      <section class="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
        <div class="relative min-w-[300px] flex-1">
          <span
            class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-slate-400"
            >search</span
          >
          <input
            type="search"
            name="followUpSearch"
            [(ngModel)]="followUpSearchQuery"
            class="w-full rounded-xl border border-slate-200/80 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#003f87] focus:outline-none focus:ring-2 focus:ring-[#003f87]/20"
            [attr.maxlength]="searchMax"
            placeholder="Search by student id, module, or intervention…"
            autocomplete="off"
          />
        </div>
        <select
          class="min-w-[160px] rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-600 focus:border-[#003f87] focus:outline-none focus:ring-2 focus:ring-[#003f87]/20"
          [(ngModel)]="moduleFilter"
          name="moduleFilter"
        >
          <option value="">All modules</option>
          @for (m of uniqueModules(); track m) {
            <option [value]="m">{{ m }}</option>
          }
        </select>
        <select
          class="min-w-[160px] rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-600 focus:border-[#003f87] focus:outline-none focus:ring-2 focus:ring-[#003f87]/20"
          [(ngModel)]="statusFilter"
          name="statusFilter"
        >
          <option value="all">All statuses</option>
          <option value="overdue">Overdue</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <button
          type="button"
          class="rounded-xl border border-slate-200/80 bg-white p-3 text-[#003f87] shadow-sm transition-colors hover:bg-slate-50"
          aria-label="Filters"
        >
          <span class="material-symbols-outlined">filter_list</span>
        </button>
      </section>

      <section class="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm">
        <div class="overflow-x-auto">
          @if (loading()) {
            <p class="px-6 py-10 text-center text-sm text-slate-500">Loading follow-ups…</p>
          } @else if (loadError()) {
            <p class="px-6 py-10 text-center text-sm text-red-600">Could not load follow-ups. Check login and API.</p>
          } @else {
            <table class="w-full border-collapse text-left">
              <thead>
                <tr class="bg-slate-50/90">
                  <th class="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Student</th>
                  <th class="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Module</th>
                  <th class="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Intervention</th>
                  <th class="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Follow-up Date</th>
                  <th class="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Status</th>
                  <th class="px-6 py-4 text-right text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (row of filteredRows; track row.id) {
                  <tr
                    class="transition-colors hover:bg-slate-50/80"
                    [class.opacity-75]="row.dimmed"
                  >
                    <td class="px-6 py-5">
                      <div class="flex items-center gap-3">
                        <div class="flex h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                          <img [src]="row.photoUrl" alt="" class="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p class="text-sm font-bold text-[#003f87]">{{ row.name }}</p>
                          <p class="text-xs text-slate-500">{{ row.studentId }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-5">
                      <span class="text-sm font-medium text-slate-800">{{ row.module }}</span>
                    </td>
                    <td class="px-6 py-5">
                      @switch (row.interventionTone) {
                        @case ('secondary') {
                          <span
                            class="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1 text-xs font-semibold text-[#003f87]"
                          >
                            <span class="material-symbols-outlined text-[14px]">{{ row.interventionIcon }}</span>
                            {{ row.interventionLabel }}
                          </span>
                        }
                        @case ('surface') {
                          <span
                            class="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                          >
                            <span class="material-symbols-outlined text-[14px]">{{ row.interventionIcon }}</span>
                            {{ row.interventionLabel }}
                          </span>
                        }
                      }
                    </td>
                    <td class="px-6 py-5">
                      <div class="flex flex-col">
                        <span class="text-sm font-bold" [ngClass]="row.dateLine1Class">{{ row.dateLine1 }}</span>
                        <span class="text-[10px] font-medium" [ngClass]="row.dateLine2Class">{{ row.dateLine2 }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-5">
                      @switch (row.status) {
                        @case ('overdue') {
                          <span
                            class="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700"
                          >
                            Overdue
                          </span>
                        }
                        @case ('pending') {
                          <span
                            class="rounded-full bg-sky-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#003f87]"
                          >
                            Pending
                          </span>
                        }
                        @case ('completed') {
                          <span
                            class="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600"
                          >
                            Completed
                          </span>
                        }
                      }
                    </td>
                    <td class="px-6 py-5 text-right">
                      <div class="flex justify-end gap-2">
                        @if (row.actions === 'check_note') {
                          <button
                            type="button"
                            class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-sky-50 hover:text-[#003f87]"
                            title="Update Status"
                            (click)="toggleStatus(row)"
                          >
                            <span class="material-symbols-outlined">check_circle</span>
                          </button>
                          <button
                            type="button"
                            class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-sky-50 hover:text-[#003f87]"
                            title="Edit Notes"
                            (click)="editNotes(row)"
                          >
                            <span class="material-symbols-outlined">sticky_note_2</span>
                          </button>
                        } @else {
                          <button
                            type="button"
                            class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-sky-50 hover:text-[#003f87]"
                            title="Reopen"
                            (click)="toggleStatus(row)"
                          >
                            <span class="material-symbols-outlined">history</span>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-6 py-10 text-center text-sm text-slate-500">No follow-ups match the current filters.</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
        <div class="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <p class="text-xs font-medium text-slate-500">
            Showing <span class="font-bold text-slate-800">{{ filteredRows.length }}</span> of
            <span class="font-bold text-slate-800">{{ allRows().length }}</span> follow-ups
          </p>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-400"
              disabled
            >
              Previous
            </button>
            <button
              type="button"
              class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-400"
              disabled
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <section class="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <div class="space-y-5 lg:col-span-2">
          <h3 class="flex items-center gap-2 font-headline text-xl font-bold text-[#003f87]">
            <span class="material-symbols-outlined text-[#003f87]">event_note</span>
            Recent notes (from interventions)
          </h3>
          <div class="grid gap-4">
            @for (note of noteFeed(); track note.id) {
              <div class="relative rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm">
                <span class="absolute right-5 top-4 text-[10px] font-bold text-slate-400">{{ note.timeAgo }}</span>
                <div class="flex gap-4 pr-20">
                  <div
                    class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    [ngClass]="note.initialsBg"
                  >
                    {{ note.initials }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800">
                      {{ note.lecturer }}
                      <span class="mx-1 font-normal text-slate-500">·</span>
                      <span class="font-mono text-xs text-[#003f87]">{{ note.student }}</span>
                    </p>
                    <p class="mt-1 text-sm italic text-slate-600">"{{ note.body }}"</p>
                  </div>
                </div>
              </div>
            } @empty {
              <p class="text-sm text-slate-500">No note text on file for recent interventions.</p>
            }
          </div>
        </div>

        <aside class="space-y-6">
          <h3 class="flex items-center gap-2 font-headline text-xl font-bold text-[#003f87]">
            <span class="material-symbols-outlined text-[#003f87]">auto_graph</span>
            Summary
          </h3>
          <div
            class="rounded-xl bg-gradient-to-br from-[#003f87] to-[#002d5c] p-6 text-white shadow-lg shadow-[#003f87]/20"
          >
            <p class="mb-4 text-xs font-bold uppercase tracking-widest text-sky-200">Live data</p>
            <p class="text-sm text-sky-100">
              {{ allRows().length }} intervention record(s) loaded from
              <code class="rounded bg-white/10 px-1">GET /api/StudentInterventions</code>. Trend charts are not wired to
              analytics yet.
            </p>
          </div>

          <div class="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <h4 class="mb-4 text-sm font-bold uppercase tracking-tight text-slate-800">Status mix</h4>
            <p class="text-xs text-slate-600">
              Open (server): {{ openServerCount() }} · Closed: {{ closedServerCount() }}
            </p>
          </div>
        </aside>
      </section>
    </div>
  `,
})
export class FollowUpsPageComponent implements OnInit {
  private readonly followUpSvc = inject(FollowUpInterventionsService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly searchMax = TABLE_FILTER_MAX_LENGTH;
  followUpSearchQuery = '';
  moduleFilter = '';
  statusFilter: 'all' | 'overdue' | 'pending' | 'completed' = 'all';

  readonly allRows = signal<FollowUpRow[]>([]);
  readonly noteFeed = signal<FollowUpNoteFeedItem[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal(false);

  readonly overdueCount = computed(() => this.allRows().filter((r) => r.status === 'overdue').length);
  readonly pendingCount = computed(() => this.allRows().filter((r) => r.status === 'pending').length);
  readonly openServerCount = computed(() => this.allRows().filter((r) => r.serverStatus === 'open').length);
  readonly closedServerCount = computed(() => this.allRows().filter((r) => r.serverStatus === 'closed').length);

  readonly uniqueModules = computed(() => {
    const set = new Set(this.allRows().map((r) => r.module).filter((m) => m && m !== '—'));
    return [...set].sort();
  });

  /** Uses ngModel fields — must be a getter, not a computed signal, so search/filters react. */
  get filteredRows(): FollowUpRow[] {
    let list = this.allRows();
    const q = this.followUpSearchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((r) =>
        [r.name, r.studentId, r.module, r.interventionLabel, r.rawNotes ?? '']
          .join(' ')
          .toLowerCase()
          .includes(q),
      );
    }
    if (this.moduleFilter) {
      list = list.filter((r) => r.module === this.moduleFilter);
    }
    if (this.statusFilter !== 'all') {
      list = list.filter((r) => r.status === this.statusFilter);
    }
    return list;
  }

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  private async reload(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(false);
    try {
      const { rows, dtos } = await this.followUpSvc.loadAll();
      this.allRows.set(rows);
      this.noteFeed.set(this.followUpSvc.buildNoteFeed(dtos));
    } catch {
      this.loadError.set(true);
      this.allRows.set([]);
      this.noteFeed.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async toggleStatus(row: FollowUpRow): Promise<void> {
    const next: 'open' | 'closed' = row.serverStatus === 'open' ? 'closed' : 'open';
    const ok = await this.confirm.ask({
      title: next === 'closed' ? 'Close follow-up?' : 'Reopen follow-up?',
      message:
        next === 'closed'
          ? 'Marks this intervention as closed on the server.'
          : 'Marks this intervention as open on the server.',
      confirmLabel: next === 'closed' ? 'Close' : 'Reopen',
      cancelLabel: 'Cancel',
    });
    if (!ok) {
      return;
    }
    const updated = await this.followUpSvc.patch(row.id, { status: next });
    if (!updated) {
      this.toast.show('Update failed.', 'error');
      return;
    }
    this.toast.show('Status saved.', 'success');
    await this.reload();
  }

  async editNotes(row: FollowUpRow): Promise<void> {
    const current = row.rawNotes ?? '';
    const next = window.prompt('Notes (preserve JSON if editing structured metadata):', current);
    if (next === null) {
      return;
    }
    const updated = await this.followUpSvc.patch(row.id, { notes: next });
    if (!updated) {
      this.toast.show('Could not save notes.', 'error');
      return;
    }
    this.toast.show('Notes saved.', 'success');
    await this.reload();
  }
}
