import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';
import { ToastService } from '../../../components/ui/toast/toast.service';
import { OptionalModulesApiService } from '../../../services/optional-modules-api.service';
import {
  ReadinessService,
  type BatchReadinessLedgerRow,
  type BatchReadinessOverview,
} from '../../../services/readiness.service';

type LedgerRisk = 'high' | 'medium' | 'low';
type LedgerStatus = 'intervention' | 'monitoring' | 'on_track';

interface CourseModuleOption {
  readonly id: string;
  readonly moduleCode: string;
  readonly moduleName: string;
}

interface QueueRow {
  id: string;
  studentId: string;
  name: string;
  avatarUrl: string;
  module: string;
  score: number;
  risk: LedgerRisk;
  status: LedgerStatus;
}

interface ModuleRiskBar {
  label: string;
  pct: number;
  barClass: 'rose' | 'navy';
}

@Component({
  standalone: true,
  selector: 'app-risk-heatmap-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto w-full max-w-[1400px] space-y-8 pb-10 font-body">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 class="mb-2 font-headline text-3xl font-extrabold tracking-tight text-[#003f87]">High-Risk Student Monitoring</h1>
          <p class="mt-2 max-w-2xl text-base text-slate-600">
            Live view from the same batch readiness feed as Batch Overview: latest <strong>submitted or graded</strong> attempt
            per student, with staff interventions count.
          </p>
        </div>
        <div class="flex shrink-0 flex-wrap gap-3">
          <button
            type="button"
            title="Coming soon"
            disabled
            class="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-400 shadow-sm opacity-70"
          >
            <span class="material-symbols-outlined text-[20px]">picture_as_pdf</span>
            Export PDF
          </button>
        </div>
      </div>

      <form
        class="rounded-2xl bg-slate-100/90 p-4 ring-1 ring-slate-200/80 md:p-5"
        [formGroup]="filterForm"
        (ngSubmit)="applyFilters()"
      >
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-4">
          <div class="grid flex-1 gap-4 sm:grid-cols-2">
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
        <p class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Could not load monitoring data. Sign in as staff and ensure the API is running.
        </p>
      }

      <!-- KPIs -->
      <div class="grid gap-4 md:grid-cols-3">
        <div
          class="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-200/40 ring-1 ring-slate-100"
        >
          <span
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100"
          >
            <span class="material-symbols-outlined text-[28px]">report</span>
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-slate-500">High-risk cases</p>
            <p class="mt-1 font-headline text-3xl font-extrabold text-[#1a2b4b]">{{ highRiskCount() }}</p>
            <p class="mt-2 text-xs font-medium text-slate-600">
              Latest attempt score <span class="font-semibold text-rose-700">&lt; 40%</span> (server rule)
            </p>
          </div>
        </div>
        <div
          class="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-200/40 ring-1 ring-slate-100"
        >
          <span
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#003f87] ring-1 ring-sky-100"
          >
            <span class="material-symbols-outlined text-[28px]">health_and_safety</span>
          </span>
          <div>
            <p class="text-sm font-medium text-slate-500">Open interventions</p>
            <p class="mt-1 font-headline text-3xl font-extrabold text-[#1a2b4b]">{{ openInterventionsCount() }}</p>
            <p class="mt-2 text-xs font-medium text-slate-500">Rows not closed on <code class="text-[11px]">StudentInterventions</code></p>
          </div>
        </div>
        <div
          class="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-200/40 ring-1 ring-slate-100"
        >
          <span
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#003f87] ring-1 ring-sky-100"
          >
            <span class="material-symbols-outlined text-[28px]">school</span>
          </span>
          <div>
            <p class="text-sm font-medium text-slate-500">Cohort average</p>
            <p class="mt-1 font-headline text-3xl font-extrabold text-[#1a2b4b]">{{ batchReadinessScore() }}%</p>
            <p class="mt-2 text-xs font-medium text-slate-500">
              Mean of latest scores ({{ totalStudents() }} student{{ totalStudents() === 1 ? '' : 's' }})
            </p>
          </div>
        </div>
      </div>

      <!-- Monitoring Queue -->
      <section class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
        <div class="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="font-headline text-lg font-bold text-[#1a2b4b]">High-risk queue</h2>
          <p class="text-sm text-slate-500">
            @if (loading()) {
              <span class="text-slate-400">Loading…</span>
            } @else {
              Showing
              <span class="font-semibold text-slate-800">{{ pagedQueueRows().length }}</span>
              of
              <span class="font-semibold text-slate-800">{{ highRiskQueueTotal() }}</span>
              high-risk student<span>{{ highRiskQueueTotal() === 1 ? '' : 's' }}</span>
            }
          </p>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="border-b border-slate-100 bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th class="px-5 py-3.5">Student ID</th>
                <th class="px-5 py-3.5">Name</th>
                <th class="px-5 py-3.5">Module</th>
                <th class="px-5 py-3.5">Score</th>
                <th class="px-5 py-3.5">Risk</th>
                <th class="px-5 py-3.5">Status</th>
                <th class="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (loading()) {
                <tr>
                  <td colspan="7" class="px-5 py-10 text-center text-sm text-slate-500">Loading queue…</td>
                </tr>
              } @else if (highRiskQueueTotal() === 0) {
                <tr>
                  <td colspan="7" class="px-5 py-10 text-center text-sm text-slate-600">
                    No high-risk students for these filters. Try another module or intake, or confirm quiz data exists.
                  </td>
                </tr>
              } @else {
                @for (row of pagedQueueRows(); track row.id) {
                  <tr class="bg-rose-50/40">
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
                      <span
                        class="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-rose-800 ring-1 ring-rose-200"
                        >High</span
                      >
                    </td>
                    <td class="px-5 py-4">
                      @switch (row.status) {
                        @case ('intervention') {
                          <span
                            class="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-900 ring-1 ring-orange-200/80"
                            >Intervention</span
                          >
                        }
                        @case ('monitoring') {
                          <span
                            class="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-[#003f87] ring-1 ring-sky-200/80"
                            >Monitoring</span
                          >
                        }
                        @default {
                          <span
                            class="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200/80"
                            >On track</span
                          >
                        }
                      }
                    </td>
                    <td class="px-5 py-4 text-right">
                      <div class="flex flex-wrap items-center justify-end gap-2">
                        <a
                          routerLink="/readiness/overview"
                          class="text-xs font-bold uppercase tracking-wide text-[#003f87] hover:underline"
                          >Batch overview</a
                        >
                        <a
                          routerLink="/monitoring/intervention-plan"
                          class="rounded-lg bg-[#003f87] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110"
                          >Intervention</a
                        >
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
        @if (highRiskQueueTotal() > pageSize) {
          <div class="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row">
            <button
              type="button"
              class="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-[#003f87] disabled:opacity-40"
              [disabled]="queuePage() <= 0"
              (click)="prevQueuePage()"
            >
              <span class="material-symbols-outlined text-[20px]">chevron_left</span>
              Previous
            </button>
            <p class="text-sm text-slate-600">
              Page <span class="font-semibold">{{ queuePage() + 1 }}</span> of
              <span class="font-semibold">{{ queuePageCount() }}</span>
            </p>
            <button
              type="button"
              class="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-[#003f87] disabled:opacity-40"
              [disabled]="queuePage() >= queuePageCount() - 1"
              (click)="nextQueuePage()"
            >
              Next
              <span class="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        }
      </section>

      <div class="grid gap-6 lg:grid-cols-2">
        <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-200/40">
          <h3 class="font-headline text-lg font-bold text-[#1a2b4b]">High-risk share by module</h3>
          <p class="mt-1 text-xs text-slate-500">Among students with a latest attempt in each module: % with high risk (&lt;40%).</p>
          <div class="mt-6 space-y-5">
            @if (loading()) {
              <p class="text-sm text-slate-500">Loading…</p>
            } @else if (moduleRiskBars().length === 0) {
              <p class="text-sm text-slate-600">Not enough cohort data to chart modules for these filters.</p>
            } @else {
              @for (m of moduleRiskBars(); track m.label) {
                <div>
                  <div class="mb-2 flex items-center justify-between text-sm">
                    <span class="font-medium text-slate-800">{{ m.label }}</span>
                    <span [class]="m.barClass === 'rose' ? 'font-bold text-rose-700' : 'font-bold text-[#003f87]'"
                      >{{ m.pct }}% high-risk</span
                    >
                  </div>
                  <div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      class="h-full rounded-full transition-all"
                      [class]="m.barClass === 'rose' ? 'bg-rose-600' : 'bg-[#003f87]'"
                      [style.width.%]="m.pct"
                    ></div>
                  </div>
                </div>
              }
            }
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-200/40">
          <h3 class="font-headline text-lg font-bold text-[#1a2b4b]">Suggested next steps</h3>
          <div class="mt-6 space-y-4">
            <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 ring-1 ring-slate-100">
              <p class="font-headline font-bold text-[#003f87]">Use interventions</p>
              <p class="mt-2 text-sm leading-relaxed text-slate-600">
                {{ openInterventionsCount() }} open intervention record(s). Close them when support is complete, or add a plan from
                <a routerLink="/monitoring/intervention-plan" class="font-semibold text-[#003f87] underline">New intervention</a>.
              </p>
            </div>
            <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 ring-1 ring-slate-100">
              <p class="font-headline font-bold text-[#003f87]">Validate readiness data</p>
              <p class="mt-2 text-sm leading-relaxed text-slate-600">
                This page reflects the same latest-attempt rules as
                <a routerLink="/readiness/overview" class="font-semibold text-[#003f87] underline">Batch Readiness Overview</a>. Adjust
                module and intake filters to match your cohort.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
})
export class RiskHeatmapPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly readiness = inject(ReadinessService);
  private readonly interventionsApi = inject(OptionalModulesApiService);
  private readonly toast = inject(ToastService);

  readonly pageSize = 8;

  readonly courseModules = signal<CourseModuleOption[]>([]);
  readonly allLedgerRows = signal<BatchReadinessLedgerRow[]>([]);
  readonly highRiskCount = signal(0);
  readonly totalStudents = signal(0);
  readonly batchReadinessScore = signal(0);
  readonly openInterventionsCount = signal(0);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly queuePage = signal(0);

  readonly filterForm = this.fb.nonNullable.group({
    moduleCode: [''],
    intake: [''],
  });

  readonly highRiskQueueTotal = computed(
    () => this.allLedgerRows().filter((r) => normalizeRisk(r.risk) === 'high').length,
  );

  readonly highRiskQueueRows = computed<QueueRow[]>(() =>
    this.allLedgerRows()
      .filter((r) => normalizeRisk(r.risk) === 'high')
      .map(mapToQueueRow),
  );

  readonly pagedQueueRows = computed(() => {
    const rows = this.highRiskQueueRows();
    const start = this.queuePage() * this.pageSize;
    return rows.slice(start, start + this.pageSize);
  });

  readonly queuePageCount = computed(() =>
    Math.max(1, Math.ceil(this.highRiskQueueRows().length / this.pageSize)),
  );

  readonly moduleRiskBars = computed<ModuleRiskBar[]>(() => buildModuleRiskBars(this.allLedgerRows()));

  constructor() {
    this.readiness.getModuleList().subscribe({
      next: (mods) =>
        this.courseModules.set(
          mods.map((m) => ({
            id: m.id,
            moduleCode: m.moduleCode,
            moduleName: m.moduleName,
          })),
        ),
      error: () => this.courseModules.set([]),
    });
    void this.reload();
  }

  applyFilters(): void {
    void this.reload(true);
  }

  prevQueuePage(): void {
    this.queuePage.update((p) => Math.max(0, p - 1));
  }

  nextQueuePage(): void {
    const max = this.queuePageCount() - 1;
    this.queuePage.update((p) => Math.min(max, p + 1));
  }

  private async reload(showToast = false): Promise<void> {
    this.queuePage.set(0);
    this.loading.set(true);
    this.loadError.set(false);
    const moduleCode = this.filterForm.controls.moduleCode.value?.trim() || undefined;
    const intake = this.filterForm.controls.intake.value?.trim() || undefined;

    let overview: BatchReadinessOverview | null = null;
    let interventions: Awaited<ReturnType<OptionalModulesApiService['fetchInterventions']>> = [];

    try {
      ;[overview, interventions] = await Promise.all([
        firstValueFrom(
          this.readiness.getBatchReadinessOverview({ moduleCode, intake }).pipe(
            catchError(() => {
              this.loadError.set(true);
              return of(null);
            }),
          ),
        ),
        this.interventionsApi.fetchInterventions().catch(() => []),
      ]);
    } catch {
      this.loadError.set(true);
    } finally {
      this.loading.set(false);
    }

    const openCount = interventions.filter((r) => (r.status ?? '').toLowerCase() !== 'closed').length;
    this.openInterventionsCount.set(openCount);

    if (!overview) {
      this.allLedgerRows.set([]);
      this.totalStudents.set(0);
      this.highRiskCount.set(0);
      this.batchReadinessScore.set(0);
      return;
    }

    this.totalStudents.set(overview.totalStudents);
    this.highRiskCount.set(overview.highRiskCount);
    this.batchReadinessScore.set(overview.batchReadinessScore);
    this.allLedgerRows.set(overview.ledgerRows);

    if (showToast) {
      this.toast.show('Monitoring data refreshed.', 'success');
    }
  }
}

function normalizeRisk(r: string): LedgerRisk {
  const x = (r ?? '').toLowerCase();
  if (x === 'high' || x === 'medium' || x === 'low') {
    return x;
  }
  return 'low';
}

function mapToQueueRow(r: BatchReadinessLedgerRow): QueueRow {
  return {
    id: r.id,
    studentId: r.studentId,
    name: r.name,
    avatarUrl: r.avatarUrl,
    module: r.module,
    score: r.score,
    risk: normalizeRisk(r.risk),
    status: normalizeStatus(r.status),
  };
}

function normalizeStatus(s: string): LedgerStatus {
  const x = (s ?? '').toLowerCase();
  if (x === 'intervention' || x === 'monitoring' || x === 'on_track') {
    return x;
  }
  return 'on_track';
}

function buildModuleRiskBars(rows: BatchReadinessLedgerRow[]): ModuleRiskBar[] {
  if (!rows.length) {
    return [];
  }
  const byModule = new Map<string, { total: number; high: number }>();
  for (const r of rows) {
    const key = (r.module ?? '—').trim() || '—';
    const cur = byModule.get(key) ?? { total: 0, high: 0 };
    cur.total += 1;
    if (normalizeRisk(r.risk) === 'high') {
      cur.high += 1;
    }
    byModule.set(key, cur);
  }
  const bars: ModuleRiskBar[] = [];
  for (const [label, { total, high }] of byModule) {
    if (total < 1) {
      continue;
    }
    const pct = Math.min(100, Math.round((100 * high) / total));
    bars.push({
      label,
      pct,
      barClass: pct >= 25 ? 'rose' : 'navy',
    });
  }
  bars.sort((a, b) => b.pct - a.pct || a.label.localeCompare(b.label));
  return bars.slice(0, 8);
}
