import { Component } from '@angular/core';

type QueueRisk = 'critical' | 'moderate' | 'low';

interface QueueRow {
  id: string;
  studentId: string;
  name: string;
  initials: string;
  initialsBg: string;
  module: string;
  risk: QueueRisk;
  weakTopics: string[];
}

@Component({
  standalone: true,
  selector: 'app-risk-heatmap-page',
  template: `
    <div class="mx-auto w-full max-w-[1400px] space-y-8 pb-10 font-body">
      <!-- Header -->
      <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 class="mb-2 font-headline text-3xl font-extrabold tracking-tight text-[#003f87]">High-Risk Student Monitoring</h1>
          <p class="mt-2 max-w-2xl text-base text-slate-600">
            Real-time identification of students requiring immediate academic intervention.
          </p>
        </div>
        <div class="flex shrink-0 flex-wrap gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span class="material-symbols-outlined text-[20px] text-slate-500">filter_list</span>
            Filter
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#003f87] shadow-sm transition hover:bg-sky-50"
          >
            <span class="material-symbols-outlined text-[20px]">picture_as_pdf</span>
            Export PDF
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid gap-4 md:grid-cols-3">
        <div
          class="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-200/40 ring-1 ring-slate-100"
        >
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
            <span class="material-symbols-outlined text-[28px]">report</span>
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-slate-500">Critical Risk Cases</p>
            <p class="mt-1 font-headline text-3xl font-extrabold text-[#1a2b4b]">42</p>
            <p class="mt-2 text-xs font-semibold text-rose-600">+12% from last week</p>
          </div>
        </div>
        <div
          class="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-200/40 ring-1 ring-slate-100"
        >
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#003f87] ring-1 ring-sky-100">
            <span class="material-symbols-outlined text-[28px]">schedule</span>
          </span>
          <div>
            <p class="text-sm font-medium text-slate-500">Active Interventions</p>
            <p class="mt-1 font-headline text-3xl font-extrabold text-[#1a2b4b]">128</p>
            <p class="mt-2 text-xs font-medium text-slate-500">Pending Review</p>
          </div>
        </div>
        <div
          class="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-200/40 ring-1 ring-slate-100"
        >
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#003f87] ring-1 ring-sky-100">
            <span class="material-symbols-outlined text-[28px]">check_circle</span>
          </span>
          <div>
            <p class="text-sm font-medium text-slate-500">Students Recovered</p>
            <p class="mt-1 font-headline text-3xl font-extrabold text-[#1a2b4b]">1,054</p>
            <p class="mt-2 text-xs font-medium text-slate-500">Success Rate <span class="font-semibold text-[#003f87]">88%</span></p>
          </div>
        </div>
      </div>

      <!-- Monitoring Queue -->
      <section class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
        <div class="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="font-headline text-lg font-bold text-[#1a2b4b]">Monitoring Queue</h2>
          <p class="text-sm text-slate-500">
            Showing <span class="font-semibold text-slate-800">{{ queueRows.length }}</span> of 42 high-risk students
          </p>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="border-b border-slate-100 bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th class="px-5 py-3.5">Student ID</th>
                <th class="px-5 py-3.5">Name</th>
                <th class="px-5 py-3.5">Module</th>
                <th class="px-5 py-3.5">Risk Level</th>
                <th class="px-5 py-3.5">Weak Topics</th>
                <th class="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (row of queueRows; track row.id) {
                <tr [class]="row.risk === 'critical' ? 'bg-rose-50/50' : ''">
                  <td class="whitespace-nowrap px-5 py-4 font-semibold text-[#003f87]">{{ row.studentId }}</td>
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <div
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        [style.background]="row.initialsBg"
                      >
                        {{ row.initials }}
                      </div>
                      <span class="font-medium text-slate-900">{{ row.name }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-4 text-slate-700">{{ row.module }}</td>
                  <td class="px-5 py-4">
                    @switch (row.risk) {
                      @case ('critical') {
                        <span
                          class="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-rose-800 ring-1 ring-rose-200"
                          >Critical</span
                        >
                      }
                      @case ('moderate') {
                        <span
                          class="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-sky-900 ring-1 ring-sky-200"
                          >Moderate</span
                        >
                      }
                      @case ('low') {
                        <span
                          class="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-sky-800 ring-1 ring-sky-200"
                          >Low Risk</span
                        >
                      }
                    }
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex max-w-xs flex-wrap gap-1.5">
                      @for (t of row.weakTopics; track t) {
                        <span class="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200/80">{{
                          t
                        }}</span>
                      }
                    </div>
                  </td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex flex-wrap items-center justify-end gap-2">
                      <button type="button" class="text-xs font-bold uppercase tracking-wide text-[#003f87] hover:underline">
                        View Details
                      </button>
                      <button
                        type="button"
                        class="rounded-lg bg-[#003f87] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110"
                      >
                        Assign
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row">
          <button
            type="button"
            class="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-[#003f87] disabled:opacity-40"
            disabled
          >
            <span class="material-symbols-outlined text-[20px]">chevron_left</span>
            Previous
          </button>
          <div class="flex items-center gap-2">
            @for (p of [1, 2, 3]; track p) {
              <button
                type="button"
                [class]="
                  p === 1
                    ? 'flex h-9 min-w-[2.25rem] items-center justify-center rounded-full bg-[#003f87] text-sm font-bold text-white shadow'
                    : 'flex h-9 min-w-[2.25rem] items-center justify-center rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100'
                "
              >
                {{ p }}
              </button>
            }
          </div>
          <button type="button" class="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-[#003f87]">
            Next
            <span class="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </section>

      <!-- Bottom columns -->
      <div class="grid gap-6 lg:grid-cols-2">
        <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-200/40">
          <h3 class="font-headline text-lg font-bold text-[#1a2b4b]">High-Risk Module Distribution</h3>
          <div class="mt-6 space-y-5">
            @for (m of moduleRiskBars; track m.label) {
              <div>
                <div class="mb-2 flex items-center justify-between text-sm">
                  <span class="font-medium text-slate-800">{{ m.label }}</span>
                  <span [class]="m.barClass === 'rose' ? 'font-bold text-rose-700' : 'font-bold text-[#003f87]'"
                    >{{ m.pct }}% Failure Risk</span
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
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-200/40">
          <h3 class="font-headline text-lg font-bold text-[#1a2b4b]">Suggested Interventions</h3>
          <div class="mt-6 space-y-4">
            <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 ring-1 ring-slate-100">
              <p class="font-headline font-bold text-[#003f87]">DSA Focused Lab Session</p>
              <p class="mt-2 text-sm leading-relaxed text-slate-600">
                Targeting the bottom 15% for Binary Tree complexity.
              </p>
            </div>
            <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 ring-1 ring-slate-100">
              <p class="font-headline font-bold text-[#003f87]">Supplemental SQL Workshop</p>
              <p class="mt-2 text-sm leading-relaxed text-slate-600">
                Mandatory for students scoring below 40% in DB Assessment.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
})
export class RiskHeatmapPageComponent {
  readonly moduleRiskBars = [
    { label: 'Data Structures & Algorithms', pct: 24, barClass: 'rose' as const },
    { label: 'Software Architecture', pct: 12, barClass: 'navy' as const },
    { label: 'Digital Electronics', pct: 8, barClass: 'navy' as const },
  ];

  readonly queueRows: QueueRow[] = [
    {
      id: '1',
      studentId: 'IT21045230',
      name: 'Arjun Wickremasinghe',
      initials: 'AW',
      initialsBg: '#003f87',
      module: 'Data Structures & Algorithms',
      risk: 'critical',
      weakTopics: ['Graph Theory', 'Binary Trees'],
    },
    {
      id: '2',
      studentId: 'IT21088412',
      name: 'Dinushi Perera',
      initials: 'DP',
      initialsBg: '#64748b',
      module: 'Software Architecture',
      risk: 'moderate',
      weakTopics: ['Microservices', 'UML'],
    },
    {
      id: '3',
      studentId: 'IT21100256',
      name: 'Kavindu Gunathilake',
      initials: 'KG',
      initialsBg: '#0d9488',
      module: 'Cloud Architecture',
      risk: 'low',
      weakTopics: ['Containers'],
    },
    {
      id: '4',
      studentId: 'IT21077890',
      name: 'Nethmi Silva',
      initials: 'NS',
      initialsBg: '#7c3aed',
      module: 'Digital Electronics',
      risk: 'critical',
      weakTopics: ['Logic Gates'],
    },
  ];
}
