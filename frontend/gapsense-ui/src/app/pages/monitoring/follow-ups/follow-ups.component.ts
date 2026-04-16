import { NgClass } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AcademicDashboardService } from '../../../services/academic-dashboard.service';
import { FollowUpQueueService } from '../../../services/follow-up-queue.service';
import type { UpdateFollowUpTaskPayload } from '../../../services/follow-up-queue.service';
import { StudentMonitoringService } from '../../../services/student-monitoring.service';
import { ToastService } from '../../../components/ui/toast/toast.service';
import { TABLE_FILTER_MAX_LENGTH } from '../../../validators/form-utils';
import type {
  FollowUpActiveProgramDto,
  FollowUpManagementDto,
  FollowUpRecentNoteDto,
  FollowUpTaskDto,
} from '../../../models/follow-up-queue.model';
import type { MonitoringNoteDto } from '../../../models/student-monitoring/student-monitoring.model';

type FollowUpStatus = 'overdue' | 'pending' | 'completed';

interface FollowUpRow {
  id: string;
  studentProfileId: string;
  dueDateIso: string;
  photoUrl: string;
  name: string;
  studentId: string;
  module: string;
  interventionLabel: string;
  interventionIcon: string;
  interventionTone: 'secondary' | 'surface';
  dateLine1: string;
  dateLine1Class: string;
  dateLine2: string;
  dateLine2Class: string;
  status: FollowUpStatus;
  dimmed?: boolean;
  actions: 'check_note' | 'history_only';
}

interface LecturerNote {
  id: string;
  initials: string;
  initialsBg: string;
  lecturer: string;
  student: string;
  timeAgo: string;
  body: string;
}

type ActionModalMode = 'details' | 'reschedule';

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
            <span class="font-headline text-3xl font-extrabold text-error">{{ overdueCount }}</span>
          </div>
          <div
            class="min-w-[148px] rounded-xl border-l-4 border-[#003f87] bg-white py-4 pl-4 pr-5 shadow-sm"
          >
            <span class="mb-1 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Pending</span>
            <span class="font-headline text-3xl font-extrabold text-[#003f87]">{{ pendingCount }}</span>
          </div>
        </div>
      </header>

      @if (loading) {
        <div class="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">Loading follow-up data…</div>
      }
      @if (errorMessage) {
        <div class="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ errorMessage }}
          <button type="button" class="ml-3 font-bold underline" (click)="loadManagement()">Retry</button>
        </div>
      }

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
            (ngModelChange)="onFiltersChanged()"
            class="w-full rounded-xl border border-slate-200/80 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#003f87] focus:outline-none focus:ring-2 focus:ring-[#003f87]/20"
            [attr.maxlength]="searchMax"
            placeholder="Search by Student Name or ID..."
            autocomplete="off"
          />
        </div>
        <select
          class="min-w-[160px] rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-600 focus:border-[#003f87] focus:outline-none focus:ring-2 focus:ring-[#003f87]/20"
          [(ngModel)]="selectedModule"
          (ngModelChange)="onFiltersChanged()"
        >
          <option value="">All Modules</option>
          @for (mod of modules; track mod) {
            <option [value]="mod">{{ mod }}</option>
          }
        </select>
        <select
          class="min-w-[160px] rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-600 focus:border-[#003f87] focus:outline-none focus:ring-2 focus:ring-[#003f87]/20"
          [(ngModel)]="selectedStatus"
          (ngModelChange)="onFiltersChanged()"
        >
          <option value="all">All Statuses</option>
          <option value="Overdue">Overdue</option>
          <option value="Pending">Pending</option>
          <option value="InProgress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
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
              @for (row of followUps; track row.id) {
                <tr
                  class="transition-colors hover:bg-slate-50/80"
                  [class.opacity-75]="row.dimmed"
                >
                  <td class="px-6 py-5">
                    <div class="flex items-center gap-3">
                      <div class="flex h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                        <img [src]="row.photoUrl" [alt]="row.name" class="h-full w-full object-cover" />
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
                          title="Mark as completed"
                          [disabled]="actionBusy"
                          (click)="markCompleted(row)"
                        >
                          <span class="material-symbols-outlined">check_circle</span>
                        </button>
                        <button
                          type="button"
                          class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-sky-50 hover:text-[#003f87]"
                          title="Note / details"
                          [disabled]="actionBusy"
                          (click)="openDetailsModal(row)"
                        >
                          <span class="material-symbols-outlined">sticky_note_2</span>
                        </button>
                        <button
                          type="button"
                          class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-sky-50 hover:text-[#003f87]"
                          title="Reschedule"
                          [disabled]="actionBusy"
                          (click)="openRescheduleModal(row)"
                        >
                          <span class="material-symbols-outlined">event</span>
                        </button>
                      } @else {
                        <button
                          type="button"
                          class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-sky-50 hover:text-[#003f87]"
                          title="Note / details"
                          [disabled]="actionBusy"
                          (click)="openDetailsModal(row)"
                        >
                          <span class="material-symbols-outlined">history</span>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-6 py-8 text-center text-sm text-slate-500">No follow-up records for current filters.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <p class="text-xs font-medium text-slate-500">
            Showing <span class="font-bold text-slate-800">{{ followUps.length }}</span> of
            <span class="font-bold text-slate-800">{{ totalCount }}</span> follow-ups
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
              class="rounded-lg bg-[#003f87] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#00306a]"
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
            Recent Notes from Lecturers
          </h3>
          <div class="grid gap-4">
            @for (note of lecturerNotes; track note.id) {
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
                      <span class="mx-1 font-normal text-slate-500">on</span>
                      <span class="text-[#003f87]">{{ note.student }}</span>
                    </p>
                    <p class="mt-1 text-sm italic text-slate-600">"{{ note.body }}"</p>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="rounded-xl border border-slate-200/60 bg-white p-5 text-sm text-slate-500 shadow-sm">No lecturer notes found for this semester.</div>
            }
          </div>
        </div>

        <aside class="space-y-6">
          <h3 class="flex items-center gap-2 font-headline text-xl font-bold text-[#003f87]">
            <span class="material-symbols-outlined text-[#003f87]">auto_graph</span>
            Trend Analysis
          </h3>
          <div
            class="rounded-xl bg-gradient-to-br from-[#003f87] to-[#002d5c] p-6 text-white shadow-lg shadow-[#003f87]/20"
          >
            <p class="mb-4 text-xs font-bold uppercase tracking-widest text-sky-200">Intervention Success</p>
            <div class="mb-4 flex h-32 items-end gap-1">
              @for (bar of trendBars; track $index) {
                <div
                  class="w-full rounded-t-lg"
                  [ngClass]="$index < trendBars.length - 1 ? 'bg-white/20' : 'bg-white'"
                  [style.height.%]="bar"
                ></div>
              }
            </div>
            <p class="text-sm text-sky-100">
              Completion rate
              <span class="font-bold text-white">{{ trendDirection }} {{ trendChangeLabel }}</span>
              since last period.
            </p>
          </div>

          <div class="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <h4 class="mb-4 text-sm font-bold uppercase tracking-tight text-slate-800">Active Programs</h4>
            <div class="space-y-4">
              @for (program of activePrograms; track program.programName) {
                <div>
                  <div class="mb-1 flex items-center justify-between">
                    <span class="text-xs font-medium text-slate-500">{{ program.programName }}</span>
                    <span class="text-xs font-bold text-slate-800">{{ program.studentCount }} Students</span>
                  </div>
                  <div class="h-1.5 w-full rounded-full bg-slate-200">
                    <div class="h-1.5 rounded-full bg-[#003f87]" [style.width.%]="program.percentage"></div>
                  </div>
                </div>
              } @empty {
                <p class="text-xs text-slate-500">No active intervention programs found.</p>
              }
            </div>
          </div>
        </aside>
      </section>

      @if (actionModalOpen && selectedActionRow) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" (click)="closeActionModal()">
          <div class="w-full max-w-2xl rounded-2xl bg-white shadow-2xl" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 class="font-headline text-lg font-bold text-[#003f87]">
                @if (actionModalMode === 'details') {
                  Follow-up Note / Details
                } @else {
                  Reschedule Follow-up
                }
              </h3>
              <button type="button" class="rounded-lg p-1 text-slate-500 hover:bg-slate-100" (click)="closeActionModal()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="space-y-4 px-6 py-5">
              <div class="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span class="font-semibold text-slate-900">{{ selectedActionRow.name }}</span> ({{ selectedActionRow.studentId }})
                <span class="mx-1">•</span>
                <span>{{ selectedActionRow.module }}</span>
              </div>

              @if (actionModalMode === 'details') {
                <div>
                  <p class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Recent Notes</p>
                  <div class="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3">
                    @for (n of actionStudentNotes; track n.id) {
                      <div class="rounded-lg bg-slate-50 px-3 py-2">
                        <div class="text-xs font-semibold text-slate-700">{{ n.addedBy }} • {{ timeAgo(n.createdAt) }}</div>
                        <div class="mt-1 text-sm text-slate-700">{{ n.noteText }}</div>
                      </div>
                    } @empty {
                      <div class="text-sm text-slate-500">No notes yet for this student.</div>
                    }
                  </div>
                </div>

                <div>
                  <label class="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Lecturer Name</label>
                  <input
                    type="text"
                    [(ngModel)]="noteAuthorDraft"
                    class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#003f87] focus:outline-none focus:ring-2 focus:ring-[#003f87]/20"
                    maxlength="120"
                    placeholder="Enter lecturer name"
                  />
                </div>

                <div>
                  <label class="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Add / Update Note</label>
                  <textarea
                    [(ngModel)]="noteTextDraft"
                    rows="4"
                    class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#003f87] focus:outline-none focus:ring-2 focus:ring-[#003f87]/20"
                    maxlength="2000"
                    placeholder="Write follow-up note..."
                  ></textarea>
                </div>
              } @else {
                <div>
                  <label class="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">New Follow-up Date</label>
                  <input
                    type="date"
                    [(ngModel)]="rescheduleDate"
                    [attr.min]="rescheduleMinDate"
                    class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#003f87] focus:outline-none focus:ring-2 focus:ring-[#003f87]/20"
                  />
                  @if (rescheduleError) {
                    <p class="mt-2 text-xs font-medium text-rose-600">{{ rescheduleError }}</p>
                  }
                </div>
              }
            </div>

            <div class="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                (click)="closeActionModal()"
              >
                Cancel
              </button>
              <button
                type="button"
                class="rounded-lg bg-[#003f87] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00306a] disabled:cursor-not-allowed disabled:opacity-60"
                [disabled]="actionBusy"
                (click)="saveActionModal()"
              >
                {{ actionBusy ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class FollowUpsPageComponent implements OnInit {
  private readonly followUpsApi = inject(FollowUpQueueService);
  private readonly dashboardApi = inject(AcademicDashboardService);
  private readonly monitoringApi = inject(StudentMonitoringService);
  private readonly toast = inject(ToastService);

  readonly searchMax = TABLE_FILTER_MAX_LENGTH;
  followUpSearchQuery = '';
  selectedModule = '';
  selectedStatus = 'all';
  loading = false;
  errorMessage: string | null = null;
  totalCount = 0;
  modules: string[] = [];
  selectedSemesterId = '';

  overdueCount = 0;
  pendingCount = 0;
  trendBars: number[] = [20, 35, 40, 50, 60];
  trendDirection = 'up';
  trendChangeLabel = '0%';
  activePrograms: FollowUpActiveProgramDto[] = [];

  followUps: FollowUpRow[] = [];
  lecturerNotes: LecturerNote[] = [];
  actionBusy = false;
  actionModalOpen = false;
  actionModalMode: ActionModalMode = 'details';
  selectedActionRow: FollowUpRow | null = null;
  selectedActionTask: FollowUpTaskDto | null = null;
  actionStudentNotes: MonitoringNoteDto[] = [];
  noteTextDraft = '';
  noteAuthorDraft = 'Lecturer';
  rescheduleDate = '';
  rescheduleMinDate = '';
  rescheduleError: string | null = null;
  private readonly taskById = new Map<string, FollowUpTaskDto>();

  ngOnInit(): void {
    this.bootstrap();
  }

  onFiltersChanged(): void {
    this.loadManagement();
  }

  markCompleted(row: FollowUpRow): void {
    this.actionBusy = true;
    this.followUpsApi.markCompleted(row.id).subscribe({
      next: () => {
        this.toast.show('Follow-up marked as completed.', 'success');
        this.actionBusy = false;
        this.loadManagement();
      },
      error: (e: Error) => {
        this.actionBusy = false;
        this.toast.show(e.message, 'error');
      },
    });
  }

  openDetailsModal(row: FollowUpRow): void {
    this.selectedActionRow = row;
    this.selectedActionTask = this.taskById.get(row.id) ?? null;
    this.actionModalMode = 'details';
    this.actionModalOpen = true;
    this.noteTextDraft = '';
    this.noteAuthorDraft = 'Lecturer';
    this.rescheduleError = null;
    this.loadStudentNotes(row.studentProfileId);
  }

  openRescheduleModal(row: FollowUpRow): void {
    this.selectedActionRow = row;
    this.selectedActionTask = this.taskById.get(row.id) ?? null;
    if (!this.selectedActionTask) {
      this.toast.show('Unable to load follow-up details.', 'error');
      return;
    }

    this.actionModalMode = 'reschedule';
    this.actionModalOpen = true;
    this.rescheduleError = null;
    this.rescheduleMinDate = this.toDateInputValue(this.selectedActionTask.dueDate);
    this.rescheduleDate = this.rescheduleMinDate;
  }

  closeActionModal(): void {
    if (this.actionBusy) {
      return;
    }

    this.actionModalOpen = false;
    this.selectedActionRow = null;
    this.selectedActionTask = null;
    this.actionStudentNotes = [];
    this.noteTextDraft = '';
    this.rescheduleDate = '';
    this.rescheduleMinDate = '';
    this.rescheduleError = null;
  }

  saveActionModal(): void {
    if (!this.selectedActionRow || this.actionBusy) {
      return;
    }

    if (this.actionModalMode === 'details') {
      this.saveNoteFromModal();
      return;
    }

    this.saveRescheduleFromModal();
  }

  private bootstrap(): void {
    forkJoin({
      semesters: this.dashboardApi.listSemesters(),
      current: this.dashboardApi.getCurrentSemester(),
    }).subscribe({
      next: ({ semesters, current }) => {
        const selected = current?.id ?? semesters[0]?.id ?? '';
        this.selectedSemesterId = selected;
        if (!selected) {
          this.errorMessage = 'No semesters available for follow-up management.';
          return;
        }

        this.loadManagement();
      },
      error: (e: Error) => {
        this.errorMessage = e.message;
      },
    });
  }

  loadManagement(): void {
    if (!this.selectedSemesterId) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.followUpsApi
      .getManagement(this.selectedSemesterId, this.followUpSearchQuery, this.selectedModule, this.selectedStatus)
      .subscribe({
        next: (payload) => {
          this.applyManagementPayload(payload);
          this.loading = false;
        },
        error: (e: Error) => {
          this.errorMessage = e.message;
          this.loading = false;
        },
      });
  }

  private applyManagementPayload(payload: FollowUpManagementDto): void {
    this.totalCount = payload.totalCount;
    this.overdueCount = payload.overdueCount;
    this.pendingCount = payload.pendingCount;
    this.modules = payload.moduleOptions;
    this.taskById.clear();
    for (const item of payload.items) {
      this.taskById.set(item.id, item);
    }
    this.followUps = payload.items.map((item) => this.toRow(item));
    this.lecturerNotes = payload.recentNotes.map((note) => this.toLecturerNote(note));
    this.activePrograms = payload.activePrograms;

    const bars = payload.trend.monthlyCompletionPercents;
    this.trendBars = bars.length ? bars.map((x) => Math.max(5, Math.min(100, x))) : [20, 35, 45, 55, 60];
    this.trendDirection = payload.trend.changePercent >= 0 ? 'up' : 'down';
    this.trendChangeLabel = `${Math.abs(payload.trend.changePercent)}%`;
  }

  private toRow(item: FollowUpTaskDto): FollowUpRow {
    const due = new Date(item.dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const overdue = item.status !== 'Completed' && item.status !== 'Cancelled' && diffDays < 0;
    const status: FollowUpStatus = overdue ? 'overdue' : item.status === 'Completed' ? 'completed' : 'pending';
    const photoSeed = encodeURIComponent(item.studentId || item.studentFullName || item.id);

    let dateLine2 = 'Due soon';
    let dateLine2Class = 'text-slate-500 uppercase';
    if (status === 'completed') {
      dateLine2 = 'Done';
      dateLine2Class = 'font-bold uppercase text-emerald-600';
    } else if (overdue) {
      dateLine2 = `${Math.abs(diffDays)} day(s) overdue`;
      dateLine2Class = 'text-red-600';
    } else if (diffDays === 0) {
      dateLine2 = 'Due today';
    } else {
      dateLine2 = `In ${diffDays} day(s)`;
    }

    return {
      id: item.id,
      studentProfileId: item.studentProfileId,
      dueDateIso: item.dueDate,
      photoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${photoSeed}`,
      name: item.studentFullName || 'Unknown Student',
      studentId: item.studentId || '—',
      module: item.studentCurrentModule || 'Academic Module',
      interventionLabel: item.title,
      interventionIcon: status === 'completed' ? 'history' : 'school',
      interventionTone: status === 'completed' ? 'surface' : 'secondary',
      dateLine1: due.toLocaleDateString(),
      dateLine1Class: overdue ? 'text-red-600' : status === 'completed' ? 'text-slate-600' : 'text-[#003f87]',
      dateLine2,
      dateLine2Class,
      status,
      dimmed: status === 'completed',
      actions: status === 'completed' ? 'history_only' : 'check_note',
    };
  }

  private toLecturerNote(note: FollowUpRecentNoteDto): LecturerNote {
    const initials = this.initials(note.lecturerName);
    return {
      id: note.id,
      initials,
      initialsBg: initials.length > 1 ? 'bg-sky-100 text-[#003f87]' : 'bg-slate-200 text-slate-700',
      lecturer: note.lecturerName,
      student: note.studentName,
      timeAgo: this.timeAgo(note.createdAt),
      body: note.noteText,
    };
  }

  private initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return '?';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  timeAgo(iso: string): string {
    const ts = new Date(iso).getTime();
    const now = Date.now();
    const hours = Math.floor((now - ts) / (1000 * 60 * 60));
    if (hours < 1) {
      return 'JUST NOW';
    }
    if (hours < 24) {
      return `${hours} HOUR${hours === 1 ? '' : 'S'} AGO`;
    }
    const days = Math.floor(hours / 24);
    return days === 1 ? 'YESTERDAY' : `${days} DAYS AGO`;
  }

  private loadStudentNotes(studentProfileId: string): void {
    this.actionBusy = true;
    this.monitoringApi.getStudentDetails(studentProfileId).subscribe({
      next: (details) => {
        this.actionStudentNotes = details.notes ?? [];
        this.actionBusy = false;
      },
      error: (e: Error) => {
        this.actionBusy = false;
        this.toast.show(e.message, 'error');
      },
    });
  }

  private saveNoteFromModal(): void {
    if (!this.selectedActionRow) {
      return;
    }

    const noteText = this.noteTextDraft.trim();
    const addedBy = this.noteAuthorDraft.trim() || 'Lecturer';
    if (!noteText) {
      this.toast.show('Please enter note text.', 'info');
      return;
    }

    this.actionBusy = true;
    this.monitoringApi
      .createNote({
        studentProfileId: this.selectedActionRow.studentProfileId,
        noteType: 'follow-up',
        noteText,
        addedBy,
      })
      .subscribe({
        next: () => {
          this.toast.show('Note saved successfully.', 'success');
          this.actionBusy = false;
          this.closeActionModal();
          this.loadManagement();
        },
        error: (e: Error) => {
          this.actionBusy = false;
          this.toast.show(e.message, 'error');
        },
      });
  }

  private saveRescheduleFromModal(): void {
    if (!this.selectedActionTask || !this.selectedActionRow) {
      return;
    }

    if (!this.rescheduleDate) {
      this.rescheduleError = 'Please select a date.';
      return;
    }

    const selected = new Date(`${this.rescheduleDate}T00:00:00`);
    if (Number.isNaN(selected.getTime())) {
      this.rescheduleError = 'Please enter a valid date.';
      return;
    }

    const currentDueDate = new Date(this.selectedActionTask.dueDate);
    if (Number.isNaN(currentDueDate.getTime())) {
      this.rescheduleError = 'Current follow-up date is invalid. Please reload and try again.';
      return;
    }

    const currentFloor = new Date(currentDueDate.getFullYear(), currentDueDate.getMonth(), currentDueDate.getDate());
    if (selected < currentFloor) {
      this.rescheduleError = 'Date must be after the current follow-up date.';
      return;
    }

    this.rescheduleError = null;
    const body: UpdateFollowUpTaskPayload = {
      title: this.selectedActionTask.title,
      description: this.selectedActionTask.description,
      dueDate: selected.toISOString(),
      status: this.toStatusEnumValue(this.selectedActionTask.status),
      priority: this.toPriorityEnumValue(this.selectedActionTask.priority),
      assignedTo: this.selectedActionTask.assignedTo,
      isDismissed: this.selectedActionTask.isDismissed,
    };

    this.actionBusy = true;
    this.followUpsApi.updateTask(this.selectedActionTask.id, body).subscribe({
      next: () => {
        this.toast.show('Follow-up rescheduled successfully.', 'success');
        this.actionBusy = false;
        this.closeActionModal();
        this.loadManagement();
      },
      error: (e: Error) => {
        this.actionBusy = false;
        this.toast.show(e.message, 'error');
      },
    });
  }

  private toDateInputValue(iso: string): string {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = `${d.getMonth() + 1}`.padStart(2, '0');
    const dd = `${d.getDate()}`.padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private toStatusEnumValue(status: string): number {
    switch (status) {
      case 'Pending':
        return 0;
      case 'InProgress':
        return 1;
      case 'Completed':
        return 2;
      case 'Cancelled':
        return 3;
      default:
        return 0;
    }
  }

  private toPriorityEnumValue(priority: string): number {
    switch (priority) {
      case 'Low':
        return 0;
      case 'Medium':
        return 1;
      case 'High':
        return 2;
      case 'Critical':
        return 3;
      default:
        return 1;
    }
  }
}
