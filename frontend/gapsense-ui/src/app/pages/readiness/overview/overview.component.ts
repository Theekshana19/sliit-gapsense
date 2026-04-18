import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { ToastService } from '../../../components/ui/toast/toast.service';
import { ReadinessService, type BatchReadinessLedgerRow } from '../../../services/readiness.service';
import { controlInvalid } from '../../../validators/form-utils';

type RiskLevel = 'high' | 'medium' | 'low';
type StatusKind = 'intervention' | 'monitoring' | 'on_track';

interface CourseModuleOption {
  readonly id: string;
  readonly moduleCode: string;
  readonly moduleName: string;
}

@Component({
  standalone: true,
  selector: 'app-readiness-overview-page',
  imports: [ReactiveFormsModule],
  template: `
    <div class="mx-auto flex min-h-full w-full max-w-[1400px] flex-col pb-6">
      <header class="mb-6">
        <h1 class="mb-2 font-headline text-3xl font-extrabold tracking-tight text-[#003f87]">Batch Readiness Overview</h1>
        <p class="mt-2 text-base text-slate-600">
          Live cohort view from latest <strong>graded or submitted</strong> quiz attempts per student (same data layer as
          submissions).
        </p>
      </header>

      <form
        class="mb-8 rounded-2xl bg-slate-100/90 p-4 ring-1 ring-slate-200/80 md:p-5"
        [formGroup]="filterForm"
        (ngSubmit)="applyFilters()"
      >
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-4">
          <div class="grid flex-1 gap-4 sm:grid-cols-3">
            <label class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wide text-slate-500">Module</span>
              <select
                formControlName="moduleCode"
                class="rounded-xl border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003f87]/25"
              >
                <option value="">All modules</option>
                @for (m of courseModules(); track m.id) {
                  <option [value]="m.moduleCode">{{ m.moduleName }} ({{ m.moduleCode }})</option>
                }
              </select>
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wide text-slate-500">Intake (optional)</span>
              <input
                type="text"
                formControlName="intake"
                placeholder="e.g. February"
                class="rounded-xl border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003f87]/25"
              />
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wide text-slate-500">Semester (UI only)</span>
              <input
                type="text"
                formControlName="semester"
                readonly
                title="Not used by the server yet — intake + module drive the query."
                class="rounded-xl border-0 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500 shadow-sm ring-1 ring-slate-200"
                placeholder="Reserved"
              />
            </label>
          </div>
          <button
            type="submit"
            class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#003f87] px-5 py-3 text-sm font-semibold text-white shadow-sm ring-1 ring-[#003f87]/30 transition hover:brightness-110 lg:min-w-[200px]"
          >
            <span class="material-symbols-outlined text-[20px]">refresh</span>
            Refresh data
          </button>
        </div>
      </form>

      @if (loadError()) {
        <p class="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Could not load overview. Sign in as staff and ensure the API is running.
        </p>
      }

      <div class="mb-8 grid gap-4 md:grid-cols-3">
        <div class="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-[#003f87] ring-1 ring-sky-100">
            <span class="material-symbols-outlined text-[28px]">school</span>
          </span>
          <div>
            <p class="text-sm font-medium text-slate-500">Students (latest attempt)</p>
            <p class="mt-1 font-headline text-3xl font-extrabold text-[#1a2b4b]">{{ totalStudents() }}</p>
          </div>
        </div>
        <div
          class="flex items-start gap-4 rounded-2xl border border-slate-200/80 border-l-4 border-l-rose-600 bg-white p-5 shadow-sm"
        >
          <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
            <span class="material-symbols-outlined text-[28px]">trending_down</span>
          </span>
          <div>
            <p class="text-sm font-medium text-slate-500">High-risk (&lt;40%)</p>
            <p class="mt-1 font-headline text-3xl font-extrabold text-rose-600">{{ highRiskCount() }}</p>
          </div>
        </div>
        <div
          class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#003f87] to-[#0a4a8c] p-5 text-white shadow-lg shadow-[#003f87]/20"
        >
          <div class="relative z-10 pr-24">
            <p class="text-sm font-medium text-sky-100/90">Avg cohort score</p>
            <div class="mt-1 flex flex-wrap items-baseline gap-2">
              <span class="font-headline text-4xl font-extrabold">{{ batchReadinessScore() }}%</span>
            </div>
          </div>
        </div>
      </div>

      <section class="mb-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-200/40">
        <div class="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="font-headline text-lg font-bold text-[#1a2b4b]">Student Performance Ledger</h2>
        </div>
        <div class="overflow-x-auto">
          @if (loading()) {
            <p class="px-5 py-10 text-center text-sm text-slate-500">Loading…</p>
          } @else if (ledgerRows().length === 0) {
            <p class="px-5 py-10 text-center text-sm text-slate-600">No graded or submitted attempts match these filters.</p>
          } @else {
            <table class="min-w-full text-left text-sm">
              <thead class="border-b border-slate-100 bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th class="px-5 py-3.5">Student ID</th>
                  <th class="px-5 py-3.5">Name</th>
                  <th class="px-5 py-3.5">Module</th>
                  <th class="px-5 py-3.5">Score</th>
                  <th class="px-5 py-3.5">Risk Level</th>
                  <th class="px-5 py-3.5">Status</th>
                  <th class="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (row of ledgerRows(); track row.id) {
                  <tr class="transition-colors hover:bg-slate-50/60">
                    <td class="whitespace-nowrap px-5 py-4 font-semibold text-[#003f87]">{{ row.studentId }}</td>
                    <td class="px-5 py-4">
                      <div class="flex items-center gap-3">
                        <img
                          [src]="row.avatarUrl"
                          [alt]="row.name"
                          class="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                          width="36"
                          height="36"
                        />
                        <span class="font-medium text-slate-900">{{ row.name }}</span>
                      </div>
                    </td>
                    <td class="px-5 py-4 text-slate-700">{{ row.module }}</td>
                    <td class="px-5 py-4 font-semibold text-slate-900">{{ row.score }}%</td>
                    <td class="px-5 py-4">
                      @switch (row.risk) {
                        @case ('high') {
                          <span
                            class="inline-flex rounded-md bg-rose-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-rose-800 ring-1 ring-rose-200"
                            >High Risk</span
                          >
                        }
                        @case ('medium') {
                          <span
                            class="inline-flex rounded-md bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-200"
                            >Medium Risk</span
                          >
                        }
                        @case ('low') {
                          <span
                            class="inline-flex rounded-md bg-sky-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-sky-900 ring-1 ring-sky-200"
                            >Low Risk</span
                          >
                        }
                      }
                    </td>
                    <td class="px-5 py-4">
                      @switch (row.status) {
                        @case ('intervention') {
                          <span
                            class="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-900 ring-1 ring-orange-200/80"
                            >Intervention Pending</span
                          >
                        }
                        @case ('monitoring') {
                          <span
                            class="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-[#003f87] ring-1 ring-sky-200/80"
                            >Monitoring</span
                          >
                        }
                        @case ('on_track') {
                          <span
                            class="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200/80"
                            >On Track</span
                          >
                        }
                      }
                    </td>
                    <td class="px-5 py-4 text-right">
                      <span class="text-xs text-slate-400">—</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
        <div class="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-slate-600">
            Showing <span class="font-semibold text-slate-900">{{ ledgerRows().length }}</span> of
            <span class="font-semibold text-slate-900">{{ totalStudents() }}</span> students
          </p>
          <p class="text-xs text-slate-500">Last refresh: {{ lastLoadedLabel() }}</p>
        </div>
      </section>

      <div class="mb-10 grid gap-4 lg:grid-cols-12">
        <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-6">
          <p class="text-sm leading-relaxed text-slate-600">
            <span class="font-semibold text-slate-900">{{ highRiskCount() }} student(s)</span> are currently below the
            40% threshold on their latest attempt for the selected filters.
          </p>
        </div>
        <div class="rounded-2xl bg-slate-100/90 p-6 ring-1 ring-slate-200/80 lg:col-span-3">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cohort average</p>
          <div class="mt-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-3xl text-[#003f87]">trending_up</span>
            <span class="font-headline text-3xl font-extrabold text-[#1a2b4b]">{{ batchReadinessScore() }}%</span>
          </div>
        </div>
        <div class="rounded-2xl bg-slate-100/90 p-6 ring-1 ring-slate-200/80 lg:col-span-3">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Last Update</p>
          <div class="mt-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-3xl text-slate-500">schedule</span>
            <span class="font-headline text-xl font-extrabold leading-tight text-[#1a2b4b]">{{ lastLoadedLabel() }}</span>
          </div>
        </div>
      </div>

      <footer
        class="mt-auto flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>SLIIT GapSense Academic Monitoring</p>
        <div class="flex flex-wrap gap-4 font-semibold uppercase tracking-wide">
          <a href="#" class="hover:text-[#003f87]">Privacy Policy</a>
          <a href="#" class="hover:text-[#003f87]">Support</a>
        </div>
      </footer>
    </div>
  `,
})
export class ReadinessOverviewPageComponent {
  readonly invalid = controlInvalid;

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly readiness = inject(ReadinessService);

  readonly courseModules = signal<CourseModuleOption[]>([]);
  readonly ledgerRows = signal<LedgerRow[]>([]);
  readonly totalStudents = signal(0);
  readonly highRiskCount = signal(0);
  readonly batchReadinessScore = signal(0);
  readonly lastLoadedLabel = signal('—');
  readonly loading = signal(false);
  readonly loadError = signal(false);

  readonly filterForm = this.fb.group({
    moduleCode: this.fb.nonNullable.control(''),
    intake: this.fb.nonNullable.control(''),
    semester: this.fb.control({ value: '', disabled: true }),
  });

  constructor() {
    this.readiness.getModuleList().subscribe({
      next: (mods) => this.courseModules.set(mods),
      error: () => this.courseModules.set([]),
    });
    this.reload();
  }


  applyFilters(): void {
    this.reload(true);
  }

  private reload(showToast = false): void {
    this.loading.set(true);
    this.loadError.set(false);
    const moduleCode = this.filterForm.controls.moduleCode.value?.trim() || undefined;
    const intake = this.filterForm.controls.intake.value?.trim() || undefined;
    this.readiness
      .getBatchReadinessOverview({ moduleCode, intake })
      .pipe(
        catchError(() => {
          this.loadError.set(true);
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((data) => {
        if (!data) {
          this.ledgerRows.set([]);
          this.totalStudents.set(0);
          this.highRiskCount.set(0);
          this.batchReadinessScore.set(0);
          return;
        }
        this.totalStudents.set(data.totalStudents);
        this.highRiskCount.set(data.highRiskCount);
        this.batchReadinessScore.set(data.batchReadinessScore);
        this.ledgerRows.set(data.ledgerRows.map(mapApiRow));
        this.lastLoadedLabel.set(new Date().toLocaleString());
        if (showToast) {
          this.toast.show('Overview updated from the server.', 'success');
        }
      });
  }
}

function mapApiRow(r: BatchReadinessLedgerRow): LedgerRow {
  return {
    id: r.id,
    studentId: r.studentId,
    name: r.name,
    avatarUrl: r.avatarUrl,
    module: r.module,
    score: r.score,
    risk: r.risk as RiskLevel,
    status: r.status as StatusKind,
  };
}

interface LedgerRow {
  id: string;
  studentId: string;
  name: string;
  avatarUrl: string;
  module: string;
  score: number;
  risk: RiskLevel;
  status: StatusKind;
}
