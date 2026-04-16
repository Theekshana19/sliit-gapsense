import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { distinctUntilChanged, forkJoin } from 'rxjs';
import { ToastService } from '../../../components/ui/toast/toast.service';
import { controlInvalid } from '../../../validators/form-utils';
import type {
  BatchReadinessFilterOptions,
  BatchReadinessFilterPayload,
  BatchReadinessLedgerRow,
  BatchReadinessSummary,
} from '../../../models/batch-readiness/batch-readiness.model';
import type { StudentMonitoringDetails } from '../../../models/student-monitoring/student-monitoring.model';
import { BatchReadinessService } from '../../../services/batch-readiness.service';
import { downloadBatchReadinessOverviewPdf } from '../../../services/batch-readiness-pdf';
import { StudentMonitoringService } from '../../../services/student-monitoring.service';

type RiskLevel = 'high' | 'medium' | 'low';
type StatusKind = 'intervention' | 'monitoring' | 'on_track';

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

@Component({
  standalone: true,
  selector: 'app-readiness-overview-page',
  imports: [ReactiveFormsModule],
  template: `
    <div class="mx-auto flex min-h-full w-full max-w-[1400px] flex-col pb-6">
      @if (pageError()) {
        <div
          class="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
          role="alert"
        >
          {{ pageError() }}
        </div>
      }

      <!-- Title -->
      <header class="mb-6">
        <h1 class="mb-2 font-headline text-3xl font-extrabold tracking-tight text-[#003f87]">Batch Readiness Overview</h1>
        <p class="mt-2 text-base text-slate-600">Analyzing student performance across active cohorts.</p>
      </header>

      <!-- Filters -->
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
                formControlName="module"
                class="rounded-xl border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003f87]/25"
              >
                <option value="">All modules</option>
                @for (m of options().modules; track m.id) {
                  <option [value]="m.id">{{ m.moduleCode }} — {{ m.moduleName }}</option>
                }
              </select>
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wide text-slate-500">Intake</span>
              <select
                formControlName="intake"
                class="rounded-xl border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003f87]/25"
              >
                <option value="">All intakes</option>
                @for (i of options().intakes; track i.batchCode) {
                  <option [value]="i.batchCode">{{ i.displayLabel }}</option>
                }
              </select>
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wide text-slate-500">Semester</span>
              <select
                formControlName="semester"
                class="rounded-xl border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003f87]/25"
                [class.ring-rose-400]="invalid(filterForm.get('semester'))"
              >
                <option value="" disabled>
                  {{ optionsLoading() ? 'Loading semesters…' : 'Select semester' }}
                </option>
                @for (s of options().semesters; track s.id) {
                  <option [value]="s.id">{{ s.name }} ({{ s.academicYear }})</option>
                }
              </select>
              @if (invalid(filterForm.get('semester'))) {
                <span class="text-xs text-rose-600">Required.</span>
              }
            </label>
          </div>
          <button
            type="submit"
            class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-200/90 px-5 py-3 text-sm font-semibold text-[#003f87] shadow-sm ring-1 ring-slate-300/80 transition hover:bg-slate-200 lg:min-w-[200px]"
            [disabled]="optionsLoading() || overviewLoading()"
          >
            <span class="material-symbols-outlined text-[20px]">tune</span>
            Apply Advanced Filters
          </button>
        </div>
      </form>

      <!-- KPIs -->
      <div class="mb-8 grid gap-4 md:grid-cols-3">
        <div class="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-[#003f87] ring-1 ring-sky-100">
            <span class="material-symbols-outlined text-[28px]">school</span>
          </span>
          <div>
            <p class="text-sm font-medium text-slate-500">Total Students</p>
            <p class="mt-1 font-headline text-3xl font-extrabold text-[#1a2b4b]">
              @if (overviewLoading()) {
                <span class="text-slate-400">…</span>
              } @else {
                {{ summary()?.totalStudents ?? '—' }}
              }
            </p>
          </div>
        </div>
        <div
          class="flex items-start gap-4 rounded-2xl border border-slate-200/80 border-l-4 border-l-rose-600 bg-white p-5 shadow-sm"
        >
          <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
            <span class="material-symbols-outlined text-[28px]">trending_down</span>
          </span>
          <div>
            <p class="text-sm font-medium text-slate-500">High-Risk Count</p>
            <p class="mt-1 font-headline text-3xl font-extrabold text-rose-600">
              @if (overviewLoading()) {
                <span class="text-slate-400">…</span>
              } @else {
                {{ summary()?.highRiskCount ?? '—' }}
              }
            </p>
          </div>
        </div>
        <div
          class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#003f87] to-[#0a4a8c] p-5 text-white shadow-lg shadow-[#003f87]/20"
        >
          <div class="relative z-10 pr-24">
            <p class="text-sm font-medium text-sky-100/90">Batch Readiness Score</p>
            <div class="mt-1 flex flex-wrap items-baseline gap-2">
              <span class="font-headline text-4xl font-extrabold">
                @if (overviewLoading()) {
                  …
                } @else {
                  {{ summary()?.batchReadinessScorePercent ?? '—' }}@if (!overviewLoading() && summary()) {
                    %
                  }
                }
              </span>
              @if (!overviewLoading() && summary()?.scoreDeltaPercent != null) {
                <span class="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white">
                  {{ summary()!.scoreDeltaPercent! >= 0 ? '+' : '' }}{{ summary()!.scoreDeltaPercent }}%
                </span>
              }
            </div>
          </div>
          <div class="absolute bottom-3 right-3 flex h-16 w-24 items-end justify-end gap-1 opacity-90">
            <span class="w-2 rounded-t bg-white/30" style="height: 40%"></span>
            <span class="w-2 rounded-t bg-white/50" style="height: 65%"></span>
            <span class="w-2 rounded-t bg-white/40" style="height: 50%"></span>
            <span class="w-2 rounded-t bg-white" style="height: 85%"></span>
            <span class="w-2 rounded-t bg-white/35" style="height: 55%"></span>
          </div>
        </div>
      </div>

      <!-- Ledger -->
      <section class="mb-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-200/40">
        <div class="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="font-headline text-lg font-bold text-[#1a2b4b]">Student Performance Ledger</h2>
          <div class="flex flex-wrap items-center gap-4 text-sm font-semibold">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 text-[#003f87] transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              (click)="exportPdf()"
              [disabled]="exporting() || !filterForm.get('semester')?.value"
            >
              <span class="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              Export PDF
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 text-[#003f87] transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              (click)="openShare()"
              [disabled]="!summary()"
            >
              <span class="material-symbols-outlined text-[18px]">share</span>
              Share Report
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          @if (ledgerLoading() && ledgerRows().length === 0) {
            <p class="px-5 py-10 text-center text-sm text-slate-500">Loading ledger…</p>
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
                      <button
                        type="button"
                        class="inline-flex rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#003f87]"
                        aria-label="Open student details"
                        (click)="openStudent(row.id)"
                      >
                        <span class="material-symbols-outlined text-[22px]">chevron_right</span>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-5 py-10 text-center text-sm text-slate-500">
                      No students match the current filters.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
        <div class="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-slate-600">
            Showing
            <span class="font-semibold text-slate-900">{{ showingFrom() }}</span>
            –
            <span class="font-semibold text-slate-900">{{ showingTo() }}</span>
            of
            <span class="font-semibold text-slate-900">{{ totalCount() }}</span>
            students
          </p>
          <div class="flex flex-wrap items-center gap-1">
            <button
              type="button"
              class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
              aria-label="Previous page"
              (click)="goPage(currentPage() - 1)"
              [disabled]="currentPage() <= 1 || ledgerLoading()"
            >
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            @for (p of pageNumbers(); track p) {
              <button
                type="button"
                [class]="
                  p === currentPage()
                    ? 'flex h-9 min-w-[2.25rem] items-center justify-center rounded-full bg-[#003f87] text-sm font-bold text-white'
                    : 'flex h-9 min-w-[2.25rem] items-center justify-center rounded-full text-sm font-medium text-slate-600 hover:bg-slate-100'
                "
                (click)="goPage(p)"
                [disabled]="ledgerLoading()"
              >
                {{ p }}
              </button>
            }
            <button
              type="button"
              class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
              aria-label="Next page"
              (click)="goPage(currentPage() + 1)"
              [disabled]="currentPage() >= totalPages() || ledgerLoading()"
            >
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Bottom row -->
      <div class="mb-10 grid gap-4 lg:grid-cols-12">
        <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-6">
          <p class="text-sm leading-relaxed text-slate-600">
            The system has identified
            <span class="font-semibold text-slate-900">{{ summary()?.interventionPendingCount ?? '—' }} students</span>
            from the current filter who require immediate scheduled academic advisory sessions.
          </p>
          <div class="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              class="rounded-xl bg-[#003f87] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#003f87]/25 transition hover:brightness-110"
              (click)="notifyAllAtRisk()"
            >
              Notify All At-Risk
            </button>
            <button
              type="button"
              class="rounded-xl border-2 border-[#003f87] bg-white px-5 py-2.5 text-sm font-bold text-[#003f87] transition hover:bg-sky-50"
              (click)="openNewIntervention()"
            >
              Schedule Group Session
            </button>
          </div>
        </div>
        <div class="rounded-2xl bg-slate-100/90 p-6 ring-1 ring-slate-200/80 lg:col-span-3">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Avg Improvement</p>
          <div class="mt-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-3xl text-[#003f87]">trending_up</span>
            <span class="font-headline text-3xl font-extrabold text-[#1a2b4b]">
              @if (overviewLoading() || summary()?.averageCohortImprovementPercent == null) {
                —
              } @else {
                +{{ summary()!.averageCohortImprovementPercent }}%
              }
            </span>
          </div>
        </div>
        <div class="rounded-2xl bg-slate-100/90 p-6 ring-1 ring-slate-200/80 lg:col-span-3">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Last Update</p>
          <div class="mt-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-3xl text-slate-500">schedule</span>
            <span class="font-headline text-3xl font-extrabold text-[#1a2b4b]">{{ lastUpdateLabel() }}</span>
          </div>
        </div>
      </div>

      <!-- Page footer -->
      <footer
        class="mt-auto flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>SLIIT GapSense Academic Monitoring System v4.2.1-stable</p>
        <div class="flex flex-wrap gap-4 font-semibold uppercase tracking-wide">
          <a href="#" class="hover:text-[#003f87]">Privacy Policy</a>
          <a href="#" class="hover:text-[#003f87]">Internal Audit</a>
          <a href="#" class="hover:text-[#003f87]">Support Registry</a>
        </div>
      </footer>

      @if (shareOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true">
          <div class="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
            <h3 class="mb-2 font-headline text-lg font-bold text-[#1a2b4b]">Share report summary</h3>
            <p class="mb-3 text-sm text-slate-600">
              Copy the text below into email or Teams. It reflects the filters and figures currently on this page.
            </p>
            <textarea
              readonly
              class="mb-4 h-48 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800"
              [value]="shareText()"
            ></textarea>
            <div class="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                (click)="closeShare()"
              >
                Close
              </button>
              <button
                type="button"
                class="rounded-xl bg-[#003f87] px-4 py-2 text-sm font-bold text-white shadow-sm hover:brightness-110"
                (click)="copyShare()"
              >
                Copy to clipboard
              </button>
            </div>
          </div>
        </div>
      }

      @if (detailOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true">
          <div class="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
            <div class="mb-4 flex items-start justify-between gap-2">
              <h3 class="font-headline text-lg font-bold text-[#1a2b4b]">Student overview</h3>
              <button
                type="button"
                class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
                (click)="closeDetail()"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            @if (detailLoading()) {
              <p class="text-sm text-slate-500">Loading…</p>
            } @else if (detailError()) {
              <p class="text-sm text-rose-600">{{ detailError() }}</p>
            } @else if (detailStudent()) {
              @let s = detailStudent()!;
              <dl class="space-y-2 text-sm">
                <div><span class="font-semibold text-slate-700">Student ID:</span> {{ s.studentId }}</div>
                <div><span class="font-semibold text-slate-700">Name:</span> {{ s.fullName }}</div>
                <div><span class="font-semibold text-slate-700">Email:</span> {{ s.email }}</div>
                <div><span class="font-semibold text-slate-700">Module:</span> {{ s.currentModule }}</div>
                <div><span class="font-semibold text-slate-700">Risk:</span> {{ s.riskLevel }} ({{ s.riskScore }})</div>
                <div><span class="font-semibold text-slate-700">GPA / Attendance:</span> {{ s.gpa }} / {{ s.attendancePercentage }}%</div>
              </dl>
              <button
                type="button"
                class="mt-5 w-full rounded-xl bg-[#003f87] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:brightness-110"
                (click)="goInterventionForStudent(s)"
              >
                Open intervention workflow
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ReadinessOverviewPageComponent implements OnInit {
  readonly invalid = controlInvalid;

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly batch = inject(BatchReadinessService);
  private readonly monitoring = inject(StudentMonitoringService);
  private readonly router = inject(Router);

  readonly pageSize = 8;

  private static readonly emptyOptions: BatchReadinessFilterOptions = { semesters: [], modules: [], intakes: [] };

  readonly options = signal<BatchReadinessFilterOptions>(ReadinessOverviewPageComponent.emptyOptions);

  readonly optionsLoading = signal(false);
  readonly overviewLoading = signal(false);
  readonly ledgerLoading = signal(false);
  readonly exporting = signal(false);
  readonly pageError = signal<string | null>(null);

  readonly summary = signal<BatchReadinessSummary | null>(null);
  readonly ledgerRows = signal<LedgerRow[]>([]);
  readonly totalCount = signal(0);
  readonly currentPage = signal(1);

  readonly shareOpen = signal(false);
  readonly shareText = signal('');

  readonly detailOpen = signal(false);
  readonly detailLoading = signal(false);
  readonly detailError = signal<string | null>(null);
  readonly detailStudent = signal<StudentMonitoringDetails | null>(null);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize)));

  readonly lastUpdateLabel = computed(() => {
    const iso = this.summary()?.generatedAtUtc;
    if (!iso) {
      return '—';
    }
    return this.formatRelativeUtc(iso);
  });

  readonly filterForm = this.fb.nonNullable.group({
    module: [''],
    intake: [''],
    semester: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadInitialOptions();

    this.filterForm.controls.semester.valueChanges.pipe(distinctUntilChanged()).subscribe((semId) => {
      if (!semId || this.optionsLoading()) {
        return;
      }
      this.filterForm.patchValue({ module: '', intake: '' }, { emitEvent: false });
      this.reloadOptionsForSemester(semId);
    });
  }

  pageNumbers(): number[] {
    const tp = this.totalPages();
    const cur = this.currentPage();
    if (tp <= 5) {
      return Array.from({ length: tp }, (_, i) => i + 1);
    }
    const set = new Set<number>([1, tp, cur, cur - 1, cur + 1].filter((p) => p >= 1 && p <= tp));
    return [...set].sort((a, b) => a - b);
  }

  showingFrom(): number {
    if (this.totalCount() === 0) {
      return 0;
    }
    return (this.currentPage() - 1) * this.pageSize + 1;
  }

  showingTo(): number {
    return Math.min(this.currentPage() * this.pageSize, this.totalCount());
  }

  applyFilters(): void {
    this.filterForm.markAllAsTouched();
    if (this.filterForm.invalid) {
      this.toast.show('Select a semester before applying filters.', 'error');
      return;
    }
    this.currentPage.set(1);
    this.refreshOverviewAndLedger();
    this.toast.show('Filters applied.', 'success');
  }

  goPage(p: number): void {
    if (p < 1 || p > this.totalPages()) {
      return;
    }
    this.currentPage.set(p);
    this.loadLedgerOnly();
  }

  exportPdf(): void {
    const payload = this.buildPayload();
    if (!payload.semesterId) {
      this.toast.show('Select a semester first.', 'error');
      return;
    }
    this.exporting.set(true);
    this.batch.getExportData(payload).subscribe({
      next: (data) => {
        downloadBatchReadinessOverviewPdf(data);
        this.exporting.set(false);
        this.toast.show('PDF downloaded.', 'success');
      },
      error: (e: Error) => {
        this.exporting.set(false);
        this.toast.show(e.message, 'error');
      },
    });
  }

  openShare(): void {
    const sum = this.summary();
    if (!sum) {
      return;
    }
    const sem = this.options().semesters.find((s) => s.id === this.filterForm.getRawValue().semester);
    const mod = this.options().modules.find((m) => m.id === this.filterForm.getRawValue().module);
    const intake = this.filterForm.getRawValue().intake;
    const lines = [
      'GapSense — Batch Readiness Overview',
      `Semester: ${sem?.name ?? '—'} (${sem?.academicYear ?? '—'})`,
      `Module filter: ${mod ? `${mod.moduleCode} ${mod.moduleName}` : 'All modules'}`,
      `Intake filter: ${intake || 'All intakes'}`,
      '',
      `Total students: ${sum.totalStudents}`,
      `High-risk count: ${sum.highRiskCount}`,
      `Batch readiness score: ${sum.batchReadinessScorePercent}%`,
      sum.scoreDeltaPercent != null ? `Score delta vs cohort: ${sum.scoreDeltaPercent >= 0 ? '+' : ''}${sum.scoreDeltaPercent}%` : '',
      '',
      `Generated (UTC): ${sum.generatedAtUtc}`,
    ].filter((l) => l.length > 0);
    this.shareText.set(lines.join('\n'));
    this.shareOpen.set(true);
  }

  closeShare(): void {
    this.shareOpen.set(false);
  }

  async copyShare(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.shareText());
      this.toast.show('Summary copied.', 'success');
    } catch {
      this.toast.show('Clipboard not available in this browser.', 'error');
    }
  }

  notifyAllAtRisk(): void {
    const n = this.summary()?.interventionPendingCount;
    if (n == null) {
      this.toast.show('Load overview data first.', 'error');
      return;
    }
    this.toast.show(`Queued advisory notifications for ${n} at-risk student(s) (demo).`, 'success');
  }

  openNewIntervention(): void {
    void this.router.navigateByUrl('/monitoring/intervention-plan');
  }

  openStudent(profileId: string): void {
    this.detailOpen.set(true);
    this.detailLoading.set(true);
    this.detailError.set(null);
    this.detailStudent.set(null);
    this.monitoring.getStudentDetails(profileId).subscribe({
      next: (s) => {
        this.detailStudent.set(s);
        this.detailLoading.set(false);
      },
      error: (e: Error) => {
        this.detailError.set(e.message);
        this.detailLoading.set(false);
      },
    });
  }

  closeDetail(): void {
    this.detailOpen.set(false);
  }

  goInterventionForStudent(s: StudentMonitoringDetails): void {
    this.closeDetail();
    void this.router.navigateByUrl('/monitoring/intervention-plan');
    this.toast.show(`Continue in Intervention Plan for ${s.fullName}.`, 'success');
  }

  private loadInitialOptions(): void {
    this.optionsLoading.set(true);
    this.pageError.set(null);
    this.batch.getFilterOptions().subscribe({
      next: (opts) => {
        this.options.set(opts);
        this.optionsLoading.set(false);
        const current = opts.semesters.find((s) => s.isCurrent) ?? opts.semesters[0];
        if (current) {
          this.filterForm.patchValue({ semester: current.id }, { emitEvent: false });
          this.refreshOverviewAndLedger();
        }
      },
      error: (e: Error) => {
        this.optionsLoading.set(false);
        this.pageError.set(e.message);
        this.toast.show(e.message, 'error');
      },
    });
  }

  private reloadOptionsForSemester(semesterId: string): void {
    this.optionsLoading.set(true);
    this.batch.getFilterOptions(semesterId).subscribe({
      next: (opts) => {
        this.options.set(opts);
        this.optionsLoading.set(false);
        this.currentPage.set(1);
        this.refreshOverviewAndLedger();
      },
      error: (e: Error) => {
        this.optionsLoading.set(false);
        this.toast.show(e.message, 'error');
      },
    });
  }

  private buildPayload(): BatchReadinessFilterPayload {
    const v = this.filterForm.getRawValue();
    const moduleId = v.module?.trim();
    const intake = v.intake?.trim();
    return {
      semesterId: v.semester.trim(),
      moduleId: moduleId || null,
      intakeBatch: intake || null,
    };
  }

  private refreshOverviewAndLedger(): void {
    const payload = this.buildPayload();
    if (!payload.semesterId) {
      return;
    }
    this.overviewLoading.set(true);
    this.ledgerLoading.set(true);
    this.pageError.set(null);
    forkJoin({
      overview: this.batch.getOverview(payload),
      ledger: this.batch.getLedgerPage({ ...payload, page: this.currentPage(), pageSize: this.pageSize }),
    }).subscribe({
      next: ({ overview, ledger }) => {
        this.summary.set(overview);
        this.ledgerRows.set(ledger.items.map((r) => this.mapRow(r)));
        this.totalCount.set(ledger.totalCount);
        this.overviewLoading.set(false);
        this.ledgerLoading.set(false);
      },
      error: (e: Error) => {
        this.pageError.set(e.message);
        this.toast.show(e.message, 'error');
        this.overviewLoading.set(false);
        this.ledgerLoading.set(false);
      },
    });
  }

  private loadLedgerOnly(): void {
    const payload = this.buildPayload();
    if (!payload.semesterId) {
      return;
    }
    this.ledgerLoading.set(true);
    this.batch.getLedgerPage({ ...payload, page: this.currentPage(), pageSize: this.pageSize }).subscribe({
      next: (ledger) => {
        this.ledgerRows.set(ledger.items.map((r) => this.mapRow(r)));
        this.totalCount.set(ledger.totalCount);
        this.ledgerLoading.set(false);
      },
      error: (e: Error) => {
        this.toast.show(e.message, 'error');
        this.ledgerLoading.set(false);
      },
    });
  }

  private mapRow(r: BatchReadinessLedgerRow): LedgerRow {
    return {
      id: r.studentProfileId,
      studentId: r.studentId,
      name: r.fullName,
      avatarUrl: r.avatarUrl,
      module: r.module,
      score: r.scorePercent,
      risk: r.riskUi as RiskLevel,
      status: r.statusUi as StatusKind,
    };
  }

  private formatRelativeUtc(iso: string): string {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) {
      return 'Just now';
    }
    if (mins < 60) {
      return `${mins}m ago`;
    }
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) {
      return `${hrs}h ago`;
    }
    return d.toLocaleDateString();
  }
}
