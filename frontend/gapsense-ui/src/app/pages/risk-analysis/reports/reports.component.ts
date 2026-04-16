import { NgClass } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs';
import { StatusPillComponent } from '../../../components/ui/status-pill/status-pill.component';
import { ToastService } from '../../../components/ui/toast/toast.service';
import type { GenerateReportPayload, ReportHistoryItemDto, ReportsFormat, ReportsOptionsDto } from '../../../models/risk-analysis/reports-export.model';
import { ReportsService } from '../../../services/reports.service';
import { controlInvalid } from '../../../validators/form-utils';

type ReportTypeId = 'readiness' | 'module_risk' | 'weak_topic';

interface RecentReportRow {
  id: string;
  fileName: string;
  fileMeta: string;
  batch: string;
  generatedBy: string;
  authorInitial: string;
  authorBg: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  isPdf: boolean;
}

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
          (click)="onRecentExportsClick()"
        >
          <span class="material-symbols-outlined text-[20px] text-slate-500">schedule</span>
          Recent Exports
        </button>
      </div>

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
            <div class="mt-6 grid gap-6 md:grid-cols-3">
              <label class="block">
                <span class="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Batch Selection</span>
                <select
                  formControlName="batch"
                  class="w-full cursor-pointer rounded-xl border bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 shadow-inner focus:border-[#003f87] focus:outline-none focus:ring-2 focus:ring-[#003f87]/20"
                  [ngClass]="
                    invalid(paramsForm.get('batch'))
                      ? 'border-rose-500 ring-1 ring-rose-400/50'
                      : 'border-slate-200'
                  "
                >
                  <option value="" disabled>Select batch</option>
                  @if (optionsLoading()) {
                    <option value="" disabled>Loading batches...</option>
                  } @else if (options().intakes.length === 0) {
                    <option value="" disabled>No batches available</option>
                  } @else {
                    @for (i of options().intakes; track i.batchCode) {
                      <option [value]="i.batchCode">{{ i.displayLabel }}</option>
                    }
                  }
                </select>
                @if (invalid(paramsForm.get('batch'))) {
                  <span class="mt-1 block text-xs text-rose-600">Required.</span>
                }
              </label>
              <label class="block">
                <span class="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Module Code</span>
                <select
                  formControlName="moduleCode"
                  class="w-full cursor-pointer rounded-xl border bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 shadow-inner focus:border-[#003f87] focus:outline-none focus:ring-2 focus:ring-[#003f87]/20"
                  [ngClass]="
                    invalid(paramsForm.get('moduleCode'))
                      ? 'border-rose-500 ring-1 ring-rose-400/50'
                      : 'border-slate-200'
                  "
                >
                  <option value="" disabled>Select module</option>
                  @if (optionsLoading()) {
                    <option value="" disabled>Loading modules...</option>
                  } @else if (options().modules.length === 0) {
                    <option value="" disabled>No modules available</option>
                  } @else {
                    @for (m of options().modules; track m.id) {
                      <option [value]="m.id">{{ m.moduleCode }} - {{ m.moduleName }}</option>
                    }
                  }
                </select>
                @if (invalid(paramsForm.get('moduleCode'))) {
                  <span class="mt-1 block text-xs text-rose-600">Required.</span>
                }
              </label>
              <label class="block">
                <span class="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Semester</span>
                <select
                  formControlName="semester"
                  class="w-full cursor-pointer rounded-xl border bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 shadow-inner focus:border-[#003f87] focus:outline-none focus:ring-2 focus:ring-[#003f87]/20"
                  [ngClass]="
                    invalid(paramsForm.get('semester'))
                      ? 'border-rose-500 ring-1 ring-rose-400/50'
                      : 'border-slate-200'
                  "
                >
                  <option value="" disabled>Select semester</option>
                  @if (optionsLoading()) {
                    <option value="" disabled>Loading semesters...</option>
                  } @else if (options().semesters.length === 0) {
                    <option value="" disabled>No semesters available</option>
                  } @else {
                    @for (s of options().semesters; track s.id) {
                      <option [value]="s.id">{{ s.name }} ({{ s.academicYear }})</option>
                    }
                  }
                </select>
                @if (invalid(paramsForm.get('semester'))) {
                  <span class="mt-1 block text-xs text-rose-600">Required.</span>
                }
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
              [disabled]="generating()"
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
                Reports are generated in real-time based on the most recent sync from LMS.
              </p>
            </div>
          </div>

          <div class="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/80 p-6 shadow-md ring-1 ring-slate-100">
            <h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Export Stats</h4>
            <div class="mt-4 flex items-end justify-between gap-4">
              <div>
                <p class="text-xs font-semibold text-slate-500">Last Month Exports</p>
                <p class="mt-1 font-headline text-4xl font-extrabold text-[#1a2b4b]">
                  @if (statsLoading()) {
                    …
                  } @else {
                    {{ lastMonthExports() }}
                  }
                </p>
              </div>
              <span class="material-symbols-outlined text-6xl text-sky-200/80">cloud</span>
            </div>
            <div class="mt-6 border-t border-slate-200/80 pt-4">
              <p class="text-xs font-semibold text-slate-500">Most Exported</p>
              <span
                class="mt-2 inline-flex rounded-full bg-[#003f87] px-3 py-1 text-xs font-bold text-white shadow-sm"
                >{{ mostExported() }}</span
              >
            </div>
          </div>
        </aside>
      </div>

      <!-- Recent table -->
      <section class="overflow-hidden rounded-2xl bg-white shadow-md shadow-slate-200/50 ring-1 ring-slate-100">
        <div class="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="font-headline text-xl font-bold text-[#1a2b4b]">Recent Academic Reports</h2>
          <button type="button" class="text-sm font-semibold text-[#003f87] hover:underline" (click)="onRecentExportsClick()">
            View All History
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th class="px-6 py-4">Report Name</th>
                <th class="px-6 py-4">Batch</th>
                <th class="px-6 py-4">Generated By</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (loadingRecent()) {
                <tr>
                  <td colspan="5" class="px-6 py-8 text-center text-slate-500">Loading recent exports...</td>
                </tr>
              } @else if (recentRows().length === 0) {
                <tr>
                  <td colspan="5" class="px-6 py-8 text-center text-slate-500">No exports generated yet.</td>
                </tr>
              } @else {
              @for (row of recentRows(); track row.id) {
                <tr class="transition-colors hover:bg-slate-50/50">
                  <td class="px-6 py-4">
                    <div class="flex items-start gap-3">
                      <span class="material-symbols-outlined mt-0.5 text-[22px] text-[#003f87]">{{
                        row.isPdf ? 'picture_as_pdf' : 'table_chart'
                      }}</span>
                      <div>
                        <p class="font-semibold text-[#003f87]">{{ row.fileName }}</p>
                        <p class="mt-0.5 text-xs text-slate-500">{{ row.fileMeta }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-slate-700">{{ row.batch }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <div
                        class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                        [style.background]="row.authorBg"
                      >
                        {{ row.authorInitial }}
                      </div>
                      <span class="font-medium text-slate-800">{{ row.generatedBy }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <app-status-pill [label]="row.status" tone="info" />
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button
                      type="button"
                      class="inline-flex rounded-lg p-2 text-[#003f87] transition hover:bg-sky-50"
                      aria-label="Download"
                      (click)="onDownloadRecent(row)"
                    >
                      <span class="material-symbols-outlined text-[22px]">download</span>
                    </button>
                  </td>
                </tr>
              }
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
})
export class RiskReportsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly reports = inject(ReportsService);

  readonly invalid = controlInvalid;

  readonly paramsForm = this.fb.nonNullable.group({
    batch: ['', [Validators.required]],
    moduleCode: ['', [Validators.required]],
    semester: ['', [Validators.required]],
  });

  readonly selectedType = signal<ReportTypeId>('readiness');
  readonly format = signal<ReportsFormat>('pdf');
  readonly generating = signal(false);
  readonly loadingRecent = signal(false);
  readonly optionsLoading = signal(false);
  readonly statsLoading = signal(false);
  readonly options = signal<ReportsOptionsDto>({ semesters: [], modules: [], intakes: [] });
  readonly lastMonthExports = signal(0);
  readonly mostExported = signal('N/A');
  readonly recentRows = signal<RecentReportRow[]>([]);

  ngOnInit(): void {
    this.loadOptions();
    this.paramsForm.controls.semester.valueChanges.pipe(distinctUntilChanged()).subscribe((semesterId) => {
      if (!semesterId) {
        return;
      }
      this.loadOptions(semesterId);
    });
    this.loadRecentRows();
    this.loadStats();
  }

  generateReport(): void {
    this.paramsForm.markAllAsTouched();
    if (this.paramsForm.invalid) {
      this.toast.show('Select batch, module, and semester before generating.', 'error');
      return;
    }

    const v = this.paramsForm.getRawValue();
    const payload: GenerateReportPayload = {
      reportType: this.selectedType(),
      format: this.format(),
      semesterId: v.semester,
      batch: v.batch,
      moduleId: v.moduleCode || null,
    };

    this.generating.set(true);
    this.reports.generate(payload).subscribe({
      next: (created) => {
        this.downloadById(created.reportId, created.fileName);
        this.toast.show(`Report generated (${this.format().toUpperCase()}).`, 'success');
        this.generating.set(false);
        this.loadRecentRows();
        this.loadStats();
      },
      error: (e: Error) => {
        this.toast.show(e.message, 'error');
        this.generating.set(false);
      },
    });
  }

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

  private loadOptions(semesterId?: string): void {
    this.optionsLoading.set(true);
    this.reports.getOptions(semesterId).subscribe({
      next: (o) => {
        const previous = this.paramsForm.getRawValue();
        this.options.set(o);

        const keepBatch = o.intakes.some((x) => x.batchCode === previous.batch) ? previous.batch : '';
        const keepModule = o.modules.some((x) => x.id === previous.moduleCode) ? previous.moduleCode : '';
        const keepSemester = o.semesters.some((x) => x.id === previous.semester) ? previous.semester : '';

        if (keepBatch) {
          this.paramsForm.controls.batch.setValue(keepBatch, { emitEvent: false });
        } else if (o.intakes.length > 0) {
          this.paramsForm.controls.batch.setValue(o.intakes[0].batchCode, { emitEvent: false });
        } else {
          this.paramsForm.controls.batch.setValue('', { emitEvent: false });
        }

        if (keepModule) {
          this.paramsForm.controls.moduleCode.setValue(keepModule, { emitEvent: false });
        } else if (o.modules.length > 0) {
          this.paramsForm.controls.moduleCode.setValue(o.modules[0].id, { emitEvent: false });
        } else {
          this.paramsForm.controls.moduleCode.setValue('', { emitEvent: false });
        }

        if (keepSemester) {
          this.paramsForm.controls.semester.setValue(keepSemester, { emitEvent: false });
        } else {
          const semester = o.semesters.find((s) => s.isCurrent) ?? o.semesters[0];
          this.paramsForm.controls.semester.setValue(semester?.id ?? '', { emitEvent: false });
        }
        this.optionsLoading.set(false);
      },
      error: (e: Error) => {
        this.toast.show(e.message, 'error');
        this.optionsLoading.set(false);
      },
    });
  }

  private loadRecentRows(): void {
    this.loadingRecent.set(true);
    this.reports.getRecent(10).subscribe({
      next: (rows) => {
        this.recentRows.set(rows.map((r) => this.toRecentRow(r)));
        this.loadingRecent.set(false);
      },
      error: (e: Error) => {
        this.toast.show(e.message, 'error');
        this.loadingRecent.set(false);
      },
    });
  }

  private loadStats(): void {
    this.statsLoading.set(true);
    this.reports.getStats().subscribe({
      next: (s) => {
        this.lastMonthExports.set(s.lastMonthExports);
        this.mostExported.set(s.mostExported);
        this.statsLoading.set(false);
      },
      error: (e: Error) => {
        this.toast.show(e.message, 'error');
        this.statsLoading.set(false);
      },
    });
  }

  onRecentExportsClick(): void {
    this.loadRecentRows();
    this.toast.show('Recent exports refreshed.', 'success');
  }

  onDownloadRecent(row: RecentReportRow): void {
    this.downloadById(row.id, row.fileName);
  }

  private downloadById(reportId: string, fileName: string): void {
    this.reports.download(reportId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (e: Error) => this.toast.show(e.message, 'error'),
    });
  }

  private toRecentRow(row: ReportHistoryItemDto): RecentReportRow {
    const initial = (row.generatedBy.trim().charAt(0) || 'S').toUpperCase();
    return {
      id: row.reportId,
      fileName: row.fileName,
      fileMeta: row.fileMeta,
      batch: row.batch,
      generatedBy: row.generatedBy,
      authorInitial: initial,
      authorBg: row.generatedBy.toLowerCase().includes('system') ? '#64748b' : '#003f87',
      status: row.status === 'FAILED' ? 'FAILED' : row.status === 'PENDING' ? 'PENDING' : 'COMPLETED',
      isPdf: row.isPdf,
    };
  }
}
