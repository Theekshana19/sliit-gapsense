import { NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../components/ui/toast/toast.service';
import type { DashboardFullDto, SemesterDto } from '../../../models/dashboard/academic-dashboard.model';
import { AcademicDashboardService } from '../../../services/academic-dashboard.service';
import { FollowUpQueueService } from '../../../services/follow-up-queue.service';

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [NgClass, RouterLink],
  template: `
    <div class="w-full space-y-10 pb-12 font-body text-on-surface">
      @if (pageError()) {
        <div class="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
          {{ pageError() }}
        </div>
      }

      <!-- Header Section -->
      <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="mb-2 font-headline text-3xl font-extrabold tracking-tight text-[#003f87]">
            Academic Performance Dashboard
          </h1>
          <p class="font-medium text-slate-500">
            @if (summary(); as s) {
              Institutional monitoring — {{ s.semesterName }}
            } @else {
              Loading semester context…
            }
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <div class="relative">
            <label class="sr-only" for="dash-semester">Semester</label>
            <select
              id="dash-semester"
              class="inline-flex w-full min-w-[200px] cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
              [disabled]="loading() || semesters().length === 0"
              (change)="onSemesterChange($any($event.target).value)"
            >
              @for (sem of semesters(); track sem.id) {
                <option [value]="sem.id" [selected]="sem.id === selectedSemesterId()">
                  {{ sem.name }} ({{ sem.academicYear }})
                </option>
              }
            </select>
            <span
              class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-base text-slate-400"
              >expand_more</span
            >
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
            [disabled]="loading() || !selectedSemesterId()"
            (click)="exportCsv()"
          >
            <span class="material-symbols-outlined text-base text-slate-500">download</span>
            Export CSV
          </button>
        </div>
      </header>

      <!-- KPI Grid -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div
          class="flex min-h-[168px] flex-col justify-between rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgb(0_0_0_/_0.06)] transition-shadow hover:shadow-[0_4px_12px_rgb(0_0_0_/_0.08)]"
        >
          <div class="flex items-start justify-between gap-3">
            <span class="material-symbols-outlined text-[28px] leading-none text-on-surface" data-icon="school">school</span>
            <span class="shrink-0 text-right text-xs font-bold text-on-surface">{{ summary()?.totalStudentsTrendNote ?? '—' }}</span>
          </div>
          <div>
            <span class="mb-1 block text-sm font-medium text-[#6B7280]">Total Students</span>
            <h2 class="font-headline text-2xl font-extrabold text-on-surface">
              {{ loading() ? '…' : (summary()?.totalStudents ?? '—') }}
            </h2>
          </div>
        </div>

        <div
          class="flex min-h-[168px] flex-col justify-between rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgb(0_0_0_/_0.06)] transition-shadow hover:shadow-[0_4px_12px_rgb(0_0_0_/_0.08)]"
        >
          <div class="flex items-start justify-between gap-3">
            <span class="material-symbols-outlined text-[28px] leading-none text-on-surface" data-icon="menu_book">menu_book</span>
            <span class="shrink-0 text-right text-xs font-bold text-on-surface">Active</span>
          </div>
          <div>
            <span class="mb-1 block text-sm font-medium text-[#6B7280]">Active Modules</span>
            <h2 class="font-headline text-2xl font-extrabold text-on-surface">
              {{ loading() ? '…' : (summary()?.activeModules ?? '—') }}
            </h2>
          </div>
        </div>

        <div
          class="flex min-h-[168px] flex-col justify-between rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgb(0_0_0_/_0.06)] transition-shadow hover:shadow-[0_4px_12px_rgb(0_0_0_/_0.08)]"
        >
          <div class="flex items-start justify-between gap-3">
            <span class="material-symbols-outlined text-[28px] leading-none text-on-surface" data-icon="priority_high">priority_high</span>
            <span class="shrink-0 text-right text-xs font-bold text-error">{{ summary()?.highRiskTrendNote ?? '—' }}</span>
          </div>
          <div>
            <span class="mb-1 block text-sm font-medium text-[#6B7280]">High-Risk Students</span>
            <h2 class="font-headline text-2xl font-extrabold text-on-surface">
              {{ loading() ? '…' : (summary()?.highRiskStudents ?? '—') }}
            </h2>
          </div>
        </div>

        <div
          class="flex min-h-[168px] flex-col justify-between rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgb(0_0_0_/_0.06)] transition-shadow hover:shadow-[0_4px_12px_rgb(0_0_0_/_0.08)]"
        >
          <div class="flex items-start justify-between gap-3">
            <span class="material-symbols-outlined text-[28px] leading-none text-on-surface" data-icon="trending_up">trending_up</span>
            <span class="shrink-0 text-right text-xs font-bold text-on-surface">{{ summary()?.readinessTargetNote ?? 'Target: 85%' }}</span>
          </div>
          <div>
            <span class="mb-1 block text-sm font-medium text-[#6B7280]">Avg. Readiness Score</span>
            <h2 class="font-headline text-2xl font-extrabold text-on-surface">
              {{ loading() ? '…' : (summary()?.averageReadinessScore != null ? summary()!.averageReadinessScore + '%' : '—') }}
            </h2>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_2px_12px_rgb(15_23_42_/_0.06)] lg:col-span-2">
          <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h3 class="font-headline text-lg font-bold text-slate-900">Readiness Trend</h3>
            <div class="flex gap-6">
              <span class="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span class="h-2.5 w-2.5 rounded-full bg-[#003f87]"></span>
                {{ trendYearCurrent() }}
              </span>
              <span class="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span class="h-2.5 w-2.5 rounded-full bg-[#b8c9dc]"></span>
                {{ trendYearPrevious() }}
              </span>
            </div>
          </div>

          <div class="flex h-56 items-end justify-between gap-1.5 px-1 sm:gap-3">
            @for (b of readinessBars(); track b.label) {
              <div class="flex h-56 min-w-0 flex-1 flex-col items-center justify-end">
                <div class="relative w-full max-w-[3.5rem] flex-1 sm:max-w-none">
                  <div
                    class="absolute bottom-0 left-0 right-0 bg-[#003f87]"
                    [style.height.%]="barHeightPercent(b.curr)"
                  ></div>
                  <div
                    class="absolute left-0 right-0 rounded-t-[10px] bg-[#b8c9dc]"
                    [style.bottom.%]="barBottomPercent(b.curr)"
                    [style.height.%]="barHeightPercent(b.prev)"
                  ></div>
                </div>
                <span class="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{{ b.label }}</span>
              </div>
            }
          </div>
        </div>

        <div class="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <div class="mb-8 w-full">
            <h3 class="text-lg font-bold text-[#003f87]">Risk Distribution</h3>
          </div>
          <div class="relative mb-8 h-48 w-48">
            <div class="h-full w-full rounded-full" [style.background]="riskConicGradient()"></div>
            <div class="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
              <span class="font-headline text-2xl font-extrabold">{{ riskCenterTotal() }}</span>
              <span class="mt-1 text-[10px] font-bold text-outline uppercase">At risk (non-low)</span>
            </div>
          </div>
          <div class="w-full space-y-3">
            @for (sl of riskSlices(); track sl.level) {
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                  <span class="h-3 w-3 rounded-full" [ngClass]="riskSwatchClass(sl.level)"></span>
                  <span class="font-medium text-on-surface-variant">{{ sl.level }}</span>
                </div>
                <span class="font-bold">{{ sl.percent }}%</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Alerts & milestones -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="space-y-4 lg:col-span-1">
          <div class="mb-1 flex items-center justify-between gap-3">
            <h3 class="font-headline text-lg font-bold text-slate-800">Critical Alerts</h3>
            <span
              class="shrink-0 rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#991b1b]"
              >Action Required</span
            >
          </div>

          <div class="space-y-3">
            <div
              class="rounded-xl border border-rose-100/80 bg-[#fff5f5] p-4 pl-3 shadow-sm"
              style="border-left-width: 4px; border-left-color: #dc2626"
            >
              <div class="flex items-start gap-3">
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dc2626] text-white shadow-sm"
                  aria-hidden="true"
                >
                  <span class="material-symbols-outlined text-[22px] leading-none text-white">error</span>
                </div>
                <div class="min-w-0 flex-1">
                  <h4 class="text-sm font-bold text-[#991b1b]">Low readiness cohort</h4>
                  <p class="mt-1.5 text-sm font-medium leading-snug text-[#b91c1c]">
                    {{ highRiskAlertText() }}
                  </p>
                  <a
                    routerLink="/monitoring/intervention-plan"
                    class="mt-3 inline-block text-[11px] font-extrabold uppercase tracking-wide text-[#991b1b] underline-offset-2 hover:underline"
                    >Launch Intervention</a
                  >
                </div>
              </div>
            </div>

            @if (!followUpCardHidden()) {
              <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div class="flex items-start gap-3">
                  <span class="material-symbols-outlined mt-0.5 text-[26px] text-orange-500" aria-hidden="true">assignment_late</span>
                  <div class="min-w-0 flex-1">
                    <h4 class="text-sm font-bold text-slate-900">Follow-up queue</h4>
                    <p class="mt-1.5 text-sm font-medium leading-snug text-slate-600">
                      {{ followUpCardMessage() }}
                    </p>
                    @if (followUpQueueError()) {
                      <p class="mt-2 text-xs font-medium text-rose-600">{{ followUpQueueError() }}</p>
                    }
                    <div class="mt-3 flex flex-wrap items-center gap-4">
                      <button
                        type="button"
                        [disabled]="followUpActionsLocked()"
                        [attr.title]="followUpRemindTitle()"
                        (click)="remindAllFollowUps()"
                        class="text-[11px] font-extrabold uppercase tracking-wide transition-colors"
                        [ngClass]="
                          followUpActionsLocked()
                            ? 'cursor-not-allowed text-slate-400'
                            : 'cursor-pointer text-[#003f87] hover:underline'
                        "
                      >
                        Remind All
                      </button>
                      <button
                        type="button"
                        [disabled]="followUpActionsLocked()"
                        [attr.title]="followUpDismissTitle()"
                        (click)="dismissFollowUpQueue()"
                        class="text-[11px] font-extrabold uppercase tracking-wide transition-colors"
                        [ngClass]="
                          followUpActionsLocked()
                            ? 'cursor-not-allowed text-slate-400'
                            : 'cursor-pointer text-[#003f87] hover:underline'
                        "
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="relative lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-8 pb-20 shadow-sm">
          <div class="mb-6 flex items-center justify-between">
            <h3 class="font-headline text-lg font-bold text-[#003f87]">Recent Student Milestones</h3>
            <a routerLink="/risk-analysis/heatmap" class="text-sm font-bold text-[#003f87] hover:underline">View All</a>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-left">
              <thead>
                <tr class="text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th class="pb-4 font-semibold">Student Name</th>
                  <th class="pb-4 font-semibold">Module</th>
                  <th class="pb-4 text-center font-semibold">Previous Score</th>
                  <th class="pb-4 text-center font-semibold">Current Score</th>
                  <th class="pb-4 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (m of milestones(); track m.id) {
                  <tr class="group transition-colors hover:bg-slate-50/80">
                    <td class="py-4">
                      <div class="flex items-center gap-3">
                        <div
                          class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600"
                        >
                          {{ m.avatarInitial }}
                        </div>
                        <div>
                          <p class="text-sm font-bold text-slate-900">{{ m.fullName }}</p>
                          <p class="text-[10px] text-slate-500">{{ m.studentId }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-4 text-sm font-medium text-slate-600">{{ m.module }}</td>
                    <td
                      class="py-4 text-center text-sm font-bold"
                      [ngClass]="{
                        'text-slate-600': m.statusTone === 'neutral',
                        'text-red-600': m.statusTone !== 'neutral'
                      }"
                    >
                      {{ m.previousScore }}%
                    </td>
                    <td
                      class="py-4 text-center text-sm font-bold"
                      [ngClass]="{
                        'text-slate-800': m.statusTone === 'neutral',
                        'text-blue-900': m.statusTone === 'success',
                        'text-red-600': m.statusTone === 'danger'
                      }"
                    >
                      {{ m.currentScore }}%
                    </td>
                    <td class="py-4 text-right">
                      <span
                        class="rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide"
                        [ngClass]="{
                          'bg-sky-100 text-sky-900': m.statusTone === 'success',
                          'bg-slate-100 text-slate-700': m.statusTone === 'neutral',
                          'bg-red-100 text-red-800': m.statusTone === 'danger'
                        }"
                      >
                        {{ m.statusLabel }}
                      </span>
                    </td>
                  </tr>
                } @empty {
                  @if (!loading()) {
                    <tr>
                      <td colspan="5" class="px-2 py-8 text-center text-sm text-slate-500">No milestone rows for this semester.</td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>

          <a
            routerLink="/monitoring/intervention-plan"
            class="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#003f87] text-white shadow-lg shadow-[#003f87]/30 transition hover:scale-105 active:scale-95"
            aria-label="Quick intervention"
          >
            <span class="material-symbols-outlined text-2xl">bolt</span>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class DashboardPageComponent implements OnInit {
  private readonly api = inject(AcademicDashboardService);
  private readonly followUps = inject(FollowUpQueueService);
  private readonly toast = inject(ToastService);

  private static readonly followUpDefaultMessage =
    'Review high-risk milestones in the table and assign interventions from the monitoring workspace.';

  readonly loading = signal(true);
  readonly pageError = signal<string | null>(null);
  readonly followUpActionLoading = signal(false);
  /** User dismissed the card (or we hid it after dismiss); reset when semester/dashboard reloads. */
  readonly followUpCardHidden = signal(false);
  readonly semesters = signal<SemesterDto[]>([]);
  readonly selectedSemesterId = signal('');
  readonly full = signal<DashboardFullDto | null>(null);

  readonly summary = computed(() => this.full()?.summary ?? null);
  readonly milestones = computed(() => this.full()?.milestones ?? []);

  readonly trendYearCurrent = computed(() => this.full()?.readinessTrend?.currentYearLabel ?? new Date().getFullYear());
  readonly trendYearPrevious = computed(() => this.full()?.readinessTrend?.previousYearLabel ?? new Date().getFullYear() - 1);

  readonly readinessBars = computed(() => {
    const pts = this.full()?.readinessTrend?.points;
    if (!pts?.length) {
      return [
        { label: 'JAN', curr: 0, prev: 0 },
        { label: 'FEB', curr: 0, prev: 0 },
        { label: 'MAR', curr: 0, prev: 0 },
        { label: 'APR', curr: 0, prev: 0 },
        { label: 'MAY', curr: 0, prev: 0 },
        { label: 'JUN', curr: 0, prev: 0 },
        { label: 'JUL', curr: 0, prev: 0 },
      ];
    }
    return pts.map((p) => ({ label: p.label, curr: p.currentPeriod, prev: p.previousPeriod }));
  });

  readonly maxStack = computed(() => {
    const bars = this.readinessBars();
    const m = Math.max(...bars.map((b) => b.prev + b.curr), 1);
    return m;
  });

  readonly riskSlices = computed(() => this.full()?.riskDistribution?.slices ?? []);
  readonly riskCenterTotal = computed(() => this.full()?.riskDistribution?.totalAtRisk ?? 0);

  readonly highRiskAlertText = computed(() => {
    const n = this.summary()?.highRiskStudents;
    const name = this.summary()?.semesterName ?? 'this cohort';
    if (n == null) {
      return `Monitor students below readiness targets in ${name}.`;
    }
    return `${n} student(s) in ${name} are not in the low-risk band — review interventions.`;
  });

  readonly followUpCount = computed(() => this.full()?.followUpQueue?.count ?? 0);

  readonly followUpQueueError = computed(() => this.full()?.followUpQueueError ?? null);

  readonly followUpCardMessage = computed(() => {
    if (this.loading() && !this.full()) {
      return 'Loading follow-up queue…';
    }
    const q = this.full()?.followUpQueue;
    if (q) {
      return q.message;
    }
    return DashboardPageComponent.followUpDefaultMessage;
  });

  /** Only lock during HTTP — do not tie to count; disabled buttons never receive clicks. */
  readonly followUpActionsLocked = computed(() => this.loading() || this.followUpActionLoading());

  readonly followUpRemindTitle = computed(() => {
    if (this.followUpActionLoading()) {
      return 'Working…';
    }
    if (this.loading()) {
      return 'Loading queue…';
    }
    if (this.followUpCount() === 0) {
      return 'No pending items — shows a short notice when clicked.';
    }
    return 'Mark reminders as sent for all pending follow-up items in this semester.';
  });

  readonly followUpDismissTitle = computed(() => {
    if (this.followUpActionLoading()) {
      return 'Working…';
    }
    if (this.loading()) {
      return 'Loading queue…';
    }
    if (this.followUpCount() === 0) {
      return 'Hide this card for the current semester.';
    }
    return 'Dismiss all pending follow-up items for this semester.';
  });

  ngOnInit(): void {
    this.bootstrap();
  }

  remindAllFollowUps(): void {
    const id = this.selectedSemesterId();
    if (!id || this.followUpActionsLocked()) {
      return;
    }
    if (this.followUpCount() === 0) {
      this.toast.show('No pending follow-up items for this semester.', 'info');
      return;
    }
    this.followUpActionLoading.set(true);
    this.followUps.remindAll(id).subscribe({
      next: (r) => {
        this.toast.show(`Reminders recorded for ${r.remindedCount} item(s).`, 'success');
        this.followUpActionLoading.set(false);
        this.refreshDashboardFull();
      },
      error: (e: Error) => {
        this.toast.show(e.message, 'error');
        this.followUpActionLoading.set(false);
      },
    });
  }

  dismissFollowUpQueue(): void {
    const id = this.selectedSemesterId();
    if (!id || this.followUpActionsLocked()) {
      return;
    }
    if (this.followUpCount() === 0) {
      this.followUpCardHidden.set(true);
      this.toast.show('Follow-up card hidden for this view.', 'success');
      return;
    }
    this.followUpActionLoading.set(true);
    this.followUps.dismissQueue(id).subscribe({
      next: (r) => {
        this.toast.show(`Dismissed ${r.dismissedCount} follow-up item(s).`, 'success');
        this.followUpActionLoading.set(false);
        this.followUpCardHidden.set(true);
        this.refreshDashboardFull();
      },
      error: (e: Error) => {
        this.toast.show(`${e.message} Card hidden locally.`, 'error');
        this.followUpActionLoading.set(false);
        this.followUpCardHidden.set(true);
      },
    });
  }

  barHeightPercent(v: number): number {
    const mx = this.maxStack();
    return mx <= 0 ? 0 : (v / mx) * 100;
  }

  barBottomPercent(curr: number): number {
    return this.barHeightPercent(curr);
  }

  riskConicGradient(): string {
    const slices = this.riskSlices();
    if (!slices.length) {
      return 'conic-gradient(#ba1a1a 0% 33%, #ff9800 33% 66%, #003f87 66% 100%)';
    }
    const crit = slices.find((s) => s.level.includes('Critical'))?.percent ?? 0;
    const elev = slices.find((s) => s.level.includes('Elevated'))?.percent ?? 0;
    const a = Math.min(100, Math.max(0, crit));
    const b = Math.min(100, Math.max(0, a + elev));
    return `conic-gradient(#ba1a1a 0% ${a}%, #ff9800 ${a}% ${b}%, #003f87 ${b}% 100%)`;
  }

  riskSwatchClass(level: string): string {
    if (level.includes('Critical')) {
      return 'bg-error';
    }
    if (level.includes('Elevated')) {
      return 'bg-orange-500';
    }
    return 'bg-primary';
  }

  onSemesterChange(id: string): void {
    if (!id || id === this.selectedSemesterId()) {
      return;
    }
    this.selectedSemesterId.set(id);
    this.reloadDashboard();
  }

  exportCsv(): void {
    const data = this.full();
    if (!data) {
      return;
    }
    const s = data.summary;
    const lines: string[] = [];
    lines.push('Academic Performance Dashboard Export');
    lines.push(`Generated (UTC),${data.generatedAtUtc}`);
    lines.push(`Semester,${this.csvEscape(s.semesterName)}`);
    lines.push(`Total Students,${s.totalStudents}`);
    lines.push(`Active Modules,${s.activeModules}`);
    lines.push(`High-Risk Students,${s.highRiskStudents}`);
    lines.push(`Average Readiness %,${s.averageReadinessScore}`);
    lines.push('');
    lines.push('Readiness trend (label, current year, previous year)');
    for (const p of data.readinessTrend.points) {
      lines.push(`${p.label},${p.currentPeriod},${p.previousPeriod}`);
    }
    lines.push('');
    lines.push('Risk distribution (level, count, percent)');
    for (const r of data.riskDistribution.slices) {
      lines.push(`${this.csvEscape(r.level)},${r.count},${r.percent}`);
    }
    lines.push('');
    lines.push('Milestones (studentId, name, module, prev%, curr%, status)');
    for (const m of data.milestones) {
      lines.push(
        `${this.csvEscape(m.studentId)},${this.csvEscape(m.fullName)},${this.csvEscape(m.module)},${m.previousScore},${m.currentScore},${this.csvEscape(m.statusLabel)}`,
      );
    }
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Academic-Performance-Dashboard-Report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  private csvEscape(v: string): string {
    if (v.includes(',') || v.includes('"') || v.includes('\n')) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  }

  private bootstrap(): void {
    this.pageError.set(null);
    this.loading.set(true);
    this.api.listSemesters().subscribe({
      next: (list) => {
        this.semesters.set(list);
        if (list.length === 0) {
          this.pageError.set('No semesters found. Run API database seeding or add semesters.');
          this.loading.set(false);
          return;
        }
        this.api.getCurrentSemester().subscribe({
          next: (cur) => {
            const id = cur?.id ?? list[0].id;
            this.selectedSemesterId.set(id);
            this.reloadDashboard();
          },
          error: (e: Error) => {
            this.pageError.set(e.message);
            this.selectedSemesterId.set(list[0].id);
            this.reloadDashboard();
          },
        });
      },
      error: (e: Error) => {
        this.pageError.set(e.message);
        this.loading.set(false);
      },
    });
  }

  private reloadDashboard(): void {
    const id = this.selectedSemesterId();
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.followUpCardHidden.set(false);
    this.loading.set(true);
    this.pageError.set(null);
    this.api.getFull(id).subscribe({
      next: (payload) => {
        this.full.set(payload);
        this.loading.set(false);
      },
      error: (e: Error) => {
        this.pageError.set(e.message);
        this.loading.set(false);
      },
    });
  }

  private refreshDashboardFull(): void {
    const id = this.selectedSemesterId();
    if (!id) {
      return;
    }
    this.api.getFull(id).subscribe({
      next: (payload) => this.full.set(payload),
      error: (e: Error) => this.toast.show(e.message, 'error'),
    });
  }
}
