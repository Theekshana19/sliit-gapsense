import { NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StatusPillComponent } from '../../../components/ui/status-pill/status-pill.component';
import { ToastService } from '../../../components/ui/toast/toast.service';
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
                  <option value="bsc-cs-2023">BSc CS - Intake 2023</option>
                  <option value="bsc-it-2023">BSc IT - Intake 2023</option>
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
                  <option value="it1010">IT1010 - Intro to Programming</option>
                  <option value="it2020">IT2020 - Data Structures</option>
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
                  <option value="y1s1">Year 01 - Semester 01</option>
                  <option value="y1s2">Year 01 - Semester 02</option>
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
                <p class="mt-1 font-headline text-4xl font-extrabold text-[#1a2b4b]">124</p>
              </div>
              <span class="material-symbols-outlined text-6xl text-sky-200/80">cloud</span>
            </div>
            <div class="mt-6 border-t border-slate-200/80 pt-4">
              <p class="text-xs font-semibold text-slate-500">Most Exported</p>
              <span
                class="mt-2 inline-flex rounded-full bg-[#003f87] px-3 py-1 text-xs font-bold text-white shadow-sm"
                >Student Risk</span
              >
            </div>
          </div>
        </aside>
      </div>

      <!-- Recent table -->
      <section class="overflow-hidden rounded-2xl bg-white shadow-md shadow-slate-200/50 ring-1 ring-slate-100">
        <div class="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="font-headline text-xl font-bold text-[#1a2b4b]">Recent Academic Reports</h2>
          <button type="button" class="text-sm font-semibold text-[#003f87] hover:underline">View All History</button>
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
              @for (row of recentRows; track row.id) {
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
                    >
                      <span class="material-symbols-outlined text-[22px]">download</span>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
})
export class RiskReportsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly invalid = controlInvalid;

  readonly paramsForm = this.fb.nonNullable.group({
    batch: ['', [Validators.required]],
    moduleCode: ['', [Validators.required]],
    semester: ['', [Validators.required]],
  });

  readonly selectedType = signal<ReportTypeId>('readiness');
  readonly format = signal<'pdf' | 'csv'>('pdf');

  generateReport(): void {
    this.paramsForm.markAllAsTouched();
    if (this.paramsForm.invalid) {
      this.toast.show('Select batch, module, and semester before generating.', 'error');
      return;
    }
    this.toast.show(`Report queued (${this.format().toUpperCase()}, mock).`, 'success');
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

  readonly recentRows: RecentReportRow[] = [
    {
      id: '1',
      fileName: 'ModuleRisk_IT1010_23.pdf',
      fileMeta: 'Oct 12, 2023 • 2.4 MB',
      batch: 'BSc CS - 2023 Intake',
      generatedBy: 'Prof. Gamage',
      authorInitial: 'G',
      authorBg: '#003f87',
      status: 'COMPLETED',
      isPdf: true,
    },
    {
      id: '2',
      fileName: 'WeakTopics_DataStructures.csv',
      fileMeta: 'Oct 10, 2023 • 840 KB',
      batch: 'BSc IT - 2023 Intake',
      generatedBy: 'Admin_S01',
      authorInitial: 'A',
      authorBg: '#64748b',
      status: 'COMPLETED',
      isPdf: false,
    },
  ];
}
