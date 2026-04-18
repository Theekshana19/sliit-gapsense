import { NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StatusPillComponent } from '../../../components/ui/status-pill/status-pill.component';
import { ToastService } from '../../../components/ui/toast/toast.service';
import type { RiskTrendsSummaryViewModel } from '../../../models/risk-analysis/risk-trends-summary.model';
import type { WeakTopicAnalysisViewModel } from '../../../models/risk-analysis/weak-topic-analysis.model';
import type { CourseModuleDto, StudentInterventionDto } from '../../../services/optional-modules-api.service';
import type { InterventionReportRow } from '../../../services/reports-snapshot.service';
import { ReportsSnapshotService } from '../../../services/reports-snapshot.service';
import { controlInvalid } from '../../../validators/form-utils';

type ReportTypeId = 'readiness' | 'module_risk' | 'weak_topic';

@Component({
  standalone: true,
  selector: 'app-risk-reports-page',
  imports: [NgClass, ReactiveFormsModule, StatusPillComponent],
  template: `
    <div class="mx-auto w-full max-w-[1400px] space-y-8 pb-12 font-body">
      <!-- Header -->
      <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div class="max-w-2xl">
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-[#003f87]">Institutional Intelligence</p>
          <h1 class="mb-2 font-headline text-3xl font-extrabold tracking-tight text-[#003f87]">Reports &amp; Export</h1>
          <p class="mt-3 text-base leading-relaxed text-slate-600">
            Generate comprehensive academic insights and export raw data for administrative compliance and intervention tracking.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <span class="material-symbols-outlined text-[20px] text-slate-500">schedule</span>
          Recent Exports
        </button>
      </div>

      @if (loadError()) {
        <p class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Could not load report data. Check that you are signed in and the API is running.
        </p>
      }

      <div class="grid gap-8 xl:grid-cols-[1fr_340px]">
        <!-- Main column -->
        <div class="space-y-8">
          <!-- Step 1 -->
          <section class="rounded-2xl bg-white p-6 shadow-md shadow-slate-200/50 ring-1 ring-slate-100 md:p-8">
            <h2 class="text-lg font-bold text-[#1a2b4b]">1. Select Report Type</h2>
            <div class="mt-6 grid gap-4 md:grid-cols-3">
              @for (opt of reportTypes; track opt.id) {
                <button
                  type="button"
                  (click)="selectedType.set(opt.id)"
                  [ngClass]="
                    selectedType() === opt.id
                      ? 'border-2 border-[#003f87] bg-sky-50/60 shadow-md shadow-[#003f87]/10 ring-1 ring-[#003f87]/20'
                      : 'border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                  "
                  class="flex flex-col items-start gap-3 rounded-2xl p-5 text-left transition-all"
                >
                  <span
                    class="material-symbols-outlined text-[40px] leading-none"
                    [ngClass]="opt.iconClass"
                    >{{ opt.icon }}</span
                  >
                  <span class="text-base font-bold leading-snug text-[#1a2b4b]">{{ opt.title }}</span>
                  <span class="text-xs leading-relaxed text-slate-600">{{ opt.description }}</span>
                </button>
              }
            </div>
          </section>

          <!-- Step 2 -->
          <section
            class="rounded-2xl bg-white p-6 shadow-md shadow-slate-200/50 ring-1 ring-slate-100 md:p-8"
            [formGroup]="paramsForm"
          >
            <h2 class="text-lg font-bold text-[#1a2b4b]">2. Refine Parameters</h2>
            <p class="mt-2 text-xs text-slate-500">
              Module list from <code>/api/CourseModules</code>. Analytics use <code>/api/student-analytics</code> for your
              account; intervention rows are from <code>/api/StudentInterventions</code>.
            </p>
            <div class="mt-6 grid gap-6 md:grid-cols-3">
              <label class="block">
                <span class="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Batch Selection</span>
                <select
                  formControlName="batch"
                  class="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 shadow-inner focus:border-[#003f87] focus:outline-none focus:ring-2 focus:ring-[#003f87]/20"
                >
                  <option value="all">All cohorts</option>
                </select>
              </label>
              <label class="block">
                <span class="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Module Code</span>
                <select
                  formControlName="moduleCode"
                  (change)="onModuleFilterChange()"
                  class="w-full cursor-pointer rounded-xl border bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 shadow-inner focus:border-[#003f87] focus:outline-none focus:ring-2 focus:ring-[#003f87]/20"
                  [ngClass]="
                    invalid(paramsForm.get('moduleCode'))
                      ? 'border-rose-500 ring-1 ring-rose-400/50'
                      : 'border-slate-200'
                  "
                >
                  <option value="" disabled>Select module</option>
                  @for (m of modules(); track m.id) {
                    <option [value]="m.code">{{ m.code }} — {{ m.title }}</option>
                  }
                </select>
                @if (invalid(paramsForm.get('moduleCode'))) {
                  <span class="mt-1 block text-xs text-rose-600">Required for export.</span>
                }
              </label>
              <label class="block">
                <span class="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Semester</span>
                <select
                  formControlName="semester"
                  class="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 shadow-inner focus:border-[#003f87] focus:outline-none focus:ring-2 focus:ring-[#003f87]/20"
                >
                  <option value="all">All semesters</option>
                </select>
              </label>
            </div>
          </section>
        </div>

        <!-- Right panel -->
        <aside class="space-y-6">
          <div class="rounded-2xl bg-white p-6 shadow-md shadow-slate-200/50 ring-1 ring-slate-100">
            <h3 class="font-headline text-xl font-bold text-[#1a2b4b]">Generate &amp; Download</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-600">
              Review the selected parameters and choose your preferred output format.
            </p>
            <button
              type="button"
              class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003f87] to-[#0056b3] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#003f87]/25 transition hover:brightness-110"
              (click)="generateReport()"
            >
              <span class="material-symbols-outlined text-[22px]">description</span>
              Generate Report
            </button>
            <p class="mt-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Format Selection</p>
            <div class="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                (click)="format.set('pdf')"
                [ngClass]="
                  format() === 'pdf'
                    ? 'border-2 border-[#003f87] bg-sky-50 text-[#003f87]'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                "
                class="flex flex-col items-center gap-1 rounded-xl px-3 py-3 text-sm font-semibold transition"
              >
                <span class="material-symbols-outlined text-[28px] text-rose-600">picture_as_pdf</span>
                PDF
              </button>
              <button
                type="button"
                (click)="format.set('csv')"
                [ngClass]="
                  format() === 'csv'
                    ? 'border-2 border-[#003f87] bg-sky-50 text-[#003f87]'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                "
                class="flex flex-col items-center gap-1 rounded-xl px-3 py-3 text-sm font-semibold transition"
              >
                <span class="material-symbols-outlined text-[28px] text-emerald-600">table_chart</span>
                CSV
              </button>
            </div>
            <div class="mt-6 flex gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <span class="material-symbols-outlined shrink-0 text-slate-400">info</span>
              <p class="text-xs leading-relaxed text-slate-600">
                Live data from StudentInterventions and student-analytics (scoped to the signed-in user for analytics
                endpoints).
              </p>
            </div>
          </div>

          <div class="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/80 p-6 shadow-md ring-1 ring-slate-100">
            <h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Export Stats</h4>
            <div class="mt-4 flex items-end justify-between gap-4">
              <div>
                <p class="text-xs font-semibold text-slate-500">Interventions in view</p>
                <p class="mt-1 font-headline text-4xl font-extrabold text-[#1a2b4b]">{{ interventionCount() }}</p>
              </div>
              <span class="material-symbols-outlined text-6xl text-sky-200/80">cloud</span>
            </div>
            <div class="mt-6 border-t border-slate-200/80 pt-4">
              <p class="text-xs font-semibold text-slate-500">Risk snapshot (analytics)</p>
              <span
                class="mt-2 inline-flex rounded-full bg-[#003f87] px-3 py-1 text-xs font-bold text-white shadow-sm"
                >{{ riskHighlight() }}</span
              >
            </div>
          </div>
        </aside>
      </div>

      <!-- Recent table -->
      <section class="overflow-hidden rounded-2xl bg-white shadow-md shadow-slate-200/50 ring-1 ring-slate-100">
        <div class="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="font-headline text-xl font-bold text-[#1a2b4b]">Intervention snapshot</h2>
          <button type="button" class="text-sm font-semibold text-[#003f87] hover:underline">View All History</button>
        </div>
        @if (loading()) {
          <p class="px-6 py-10 text-center text-sm text-slate-500">Loading…</p>
        } @else {
          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm">
              <thead class="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th class="px-6 py-4">Report Name</th>
                  <th class="px-6 py-4">Module</th>
                  <th class="px-6 py-4">Student</th>
                  <th class="px-6 py-4">Status</th>
                  <th class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (row of tableRows(); track row.id) {
                  <tr class="transition-colors hover:bg-slate-50/50">
                    <td class="px-6 py-4">
                      <div class="flex items-start gap-3">
                        <span class="material-symbols-outlined mt-0.5 text-[22px] text-[#003f87]">table_chart</span>
                        <div>
                          <p class="font-semibold text-[#003f87]">{{ row.title }}</p>
                          <p class="mt-0.5 text-xs text-slate-500">{{ row.meta }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-slate-700">{{ row.moduleLabel }}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <div
                          class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                          style="background: #003f87"
                        >
                          {{ row.studentId.charAt(0).toUpperCase() }}
                        </div>
                        <span class="font-mono text-xs font-medium text-slate-800">{{ row.studentId }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <app-status-pill [label]="row.statusLabel" tone="info" />
                    </td>
                    <td class="px-6 py-4 text-right">
                      <button
                        type="button"
                        class="inline-flex rounded-lg p-2 text-[#003f87] transition hover:bg-sky-50"
                        aria-label="Download"
                        (click)="downloadRowCsv(row)"
                      >
                        <span class="material-symbols-outlined text-[22px]">download</span>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="px-6 py-10 text-center text-sm text-slate-500">No interventions returned for your role.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </div>
  `,
})
export class RiskReportsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly snapshotSvc = inject(ReportsSnapshotService);

  readonly invalid = controlInvalid;

  readonly paramsForm = this.fb.nonNullable.group({
    batch: ['all'],
    moduleCode: ['', [Validators.required]],
    semester: ['all'],
  });

  readonly selectedType = signal<ReportTypeId>('readiness');
  readonly format = signal<'pdf' | 'csv'>('csv');

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly modules = signal<CourseModuleDto[]>([]);
  readonly interventions = signal<StudentInterventionDto[]>([]);
  readonly weakTopics = signal<WeakTopicAnalysisViewModel | null>(null);
  readonly riskTrends = signal<RiskTrendsSummaryViewModel | null>(null);

  readonly tableRows = computed(() =>
    this.snapshotSvc.interventionTableRows(this.interventions(), this.modules()),
  );

  readonly interventionCount = computed(() => this.interventions().length);

  readonly riskHighlight = computed(() => {
    const m = this.riskTrends()?.summaryMetrics?.[0];
    return m ? `${m.title}: ${m.value}` : 'No analytics summary';
  });

  readonly reportTypes: {
    id: ReportTypeId;
    title: string;
    description: string;
    icon: string;
    iconClass: string;
  }[] = [
    {
      id: 'readiness',
      title: 'Student Readiness Report',
      description: 'Evaluation of individual student preparedness for upcoming modular assessments.',
      icon: 'how_to_reg',
      iconClass: 'text-[#003f87]',
    },
    {
      id: 'module_risk',
      title: 'Module Risk Report',
      description: 'Comprehensive risk mapping across entire academic modules and semesters.',
      icon: 'assignment_late',
      iconClass: 'text-rose-600',
    },
    {
      id: 'weak_topic',
      title: 'Weak Topic Report',
      description: 'Granular breakdown of curriculum topics requiring immediate remediation.',
      icon: 'lightbulb',
      iconClass: 'text-sky-600',
    },
  ];

  async ngOnInit(): Promise<void> {
    await this.reloadSnapshot();
  }

  async onModuleFilterChange(): Promise<void> {
    await this.reloadSnapshot();
  }

  private async reloadSnapshot(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(false);
    const code = this.paramsForm.controls.moduleCode.value?.trim();
    const moduleFilter = code || undefined;
    try {
      const snap = await this.snapshotSvc.loadSnapshot(moduleFilter);
      this.modules.set(snap.modules);
      this.interventions.set(snap.interventions);
      this.weakTopics.set(snap.weakTopics);
      this.riskTrends.set(snap.riskTrends);
    } catch {
      this.loadError.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  generateReport(): void {
    this.paramsForm.markAllAsTouched();
    if (this.paramsForm.invalid) {
      this.toast.show('Select a module before generating.', 'error');
      return;
    }
    const moduleCode = this.paramsForm.controls.moduleCode.value.trim();
    if (this.format() === 'pdf') {
      this.toast.show('PDF export is not available. Choose CSV.', 'info');
      return;
    }
    let csv = this.snapshotSvc.buildInterventionsCsv(this.interventions(), this.modules());
    const weak = this.weakTopics();
    csv = this.snapshotSvc.appendWeakTopicSummaryCsv(csv, weak, moduleCode);
    const fname = `gapsense-${this.selectedType()}-${moduleCode}-${new Date().toISOString().slice(0, 10)}.csv`;
    this.snapshotSvc.downloadCsv(fname, csv);
    this.toast.show('CSV downloaded.', 'success');
  }

  downloadRowCsv(row: InterventionReportRow): void {
    const dto = this.interventions().find((i) => i.id === row.id);
    if (!dto) {
      return;
    }
    const csv = this.snapshotSvc.buildInterventionsCsv([dto], this.modules());
    this.snapshotSvc.downloadCsv(`intervention-${row.id}.csv`, csv);
    this.toast.show('Row CSV downloaded.', 'success');
  }
}
