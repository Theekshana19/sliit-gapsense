import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../components/ui/toast/toast.service';
import { controlInvalid } from '../../../validators/form-utils';

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
                [class.ring-rose-400]="invalid(filterForm.get('module'))"
              >
                <option value="" disabled>Select module</option>
                <option value="ads">Advanced Database Systems</option>
                <option value="cloud">Cloud Architecture</option>
                <option value="dsa">Data Structures &amp; Algorithms</option>
                <option value="se">Software Engineering</option>
              </select>
              @if (invalid(filterForm.get('module'))) {
                <span class="text-xs text-rose-600">Required.</span>
              }
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wide text-slate-500">Intake</span>
              <select
                formControlName="intake"
                class="rounded-xl border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003f87]/25"
                [class.ring-rose-400]="invalid(filterForm.get('intake'))"
              >
                <option value="" disabled>Select intake</option>
                <option value="feb-2024">February 2024</option>
                <option value="jul-2024">July 2024</option>
              </select>
              @if (invalid(filterForm.get('intake'))) {
                <span class="text-xs text-rose-600">Required.</span>
              }
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wide text-slate-500">Semester</span>
              <select
                formControlName="semester"
                class="rounded-xl border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003f87]/25"
                [class.ring-rose-400]="invalid(filterForm.get('semester'))"
              >
                <option value="" disabled>Select semester</option>
                <option value="s01">Semester 01</option>
                <option value="s02">Semester 02</option>
              </select>
              @if (invalid(filterForm.get('semester'))) {
                <span class="text-xs text-rose-600">Required.</span>
              }
            </label>
          </div>
          <button
            type="submit"
            class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-200/90 px-5 py-3 text-sm font-semibold text-[#003f87] shadow-sm ring-1 ring-slate-300/80 transition hover:bg-slate-200 lg:min-w-[200px]"
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
            <p class="mt-1 font-headline text-3xl font-extrabold text-[#1a2b4b]">1,284</p>
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
            <p class="mt-1 font-headline text-3xl font-extrabold text-rose-600">42</p>
          </div>
        </div>
        <div
          class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#003f87] to-[#0a4a8c] p-5 text-white shadow-lg shadow-[#003f87]/20"
        >
          <div class="relative z-10 pr-24">
            <p class="text-sm font-medium text-sky-100/90">Batch Readiness Score</p>
            <div class="mt-1 flex flex-wrap items-baseline gap-2">
              <span class="font-headline text-4xl font-extrabold">88%</span>
              <span class="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white">+4.2%</span>
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
            <button type="button" class="inline-flex items-center gap-1.5 text-[#003f87] transition hover:underline">
              <span class="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              Export PDF
            </button>
            <button type="button" class="inline-flex items-center gap-1.5 text-[#003f87] transition hover:underline">
              <span class="material-symbols-outlined text-[18px]">share</span>
              Share Report
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
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
              @for (row of ledgerRows; track row.id) {
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
                    <button type="button" class="inline-flex rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#003f87]" aria-label="Open row">
                      <span class="material-symbols-outlined text-[22px]">chevron_right</span>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-slate-600">Showing <span class="font-semibold text-slate-900">4</span> of 1,284 students</p>
          <div class="flex flex-wrap items-center gap-1">
            <button type="button" class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Previous page">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            @for (p of pages; track p) {
              <button
                type="button"
                [class]="
                  p === 1
                    ? 'flex h-9 min-w-[2.25rem] items-center justify-center rounded-full bg-[#003f87] text-sm font-bold text-white'
                    : 'flex h-9 min-w-[2.25rem] items-center justify-center rounded-full text-sm font-medium text-slate-600 hover:bg-slate-100'
                "
              >
                {{ p }}
              </button>
            }
            <span class="px-1 text-slate-400">…</span>
            <button type="button" class="flex h-9 min-w-[2.25rem] items-center justify-center rounded-full text-sm font-medium text-slate-600 hover:bg-slate-100">
              32
            </button>
            <button type="button" class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Next page">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Bottom row -->
      <div class="mb-10 grid gap-4 lg:grid-cols-12">
        <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-6">
          <p class="text-sm leading-relaxed text-slate-600">
            The system has identified <span class="font-semibold text-slate-900">8 students</span> from the current filter who require
            immediate scheduled academic advisory sessions.
          </p>
          <div class="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              class="rounded-xl bg-[#003f87] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#003f87]/25 transition hover:brightness-110"
            >
              Notify All At-Risk
            </button>
            <button
              type="button"
              class="rounded-xl border-2 border-[#003f87] bg-white px-5 py-2.5 text-sm font-bold text-[#003f87] transition hover:bg-sky-50"
            >
              Schedule Group Session
            </button>
          </div>
        </div>
        <div class="rounded-2xl bg-slate-100/90 p-6 ring-1 ring-slate-200/80 lg:col-span-3">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Avg Improvement</p>
          <div class="mt-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-3xl text-[#003f87]">trending_up</span>
            <span class="font-headline text-3xl font-extrabold text-[#1a2b4b]">+12.4%</span>
          </div>
        </div>
        <div class="rounded-2xl bg-slate-100/90 p-6 ring-1 ring-slate-200/80 lg:col-span-3">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Last Update</p>
          <div class="mt-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-3xl text-slate-500">schedule</span>
            <span class="font-headline text-3xl font-extrabold text-[#1a2b4b]">2h ago</span>
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
    </div>
  `,
})
export class ReadinessOverviewPageComponent {
  readonly invalid = controlInvalid;

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly pages = [1, 2, 3];

  readonly ledgerRows: LedgerRow[] = [
    {
      id: '1',
      studentId: 'IT21045230',
      name: 'Arjun Wickremasinghe',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop',
      module: 'Advanced Databases',
      score: 32,
      risk: 'high',
      status: 'intervention',
    },
    {
      id: '2',
      studentId: 'IT21088412',
      name: 'Dinushi Perera',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop',
      module: 'Advanced Databases',
      score: 54,
      risk: 'medium',
      status: 'monitoring',
    },
    {
      id: '3',
      studentId: 'IT21100256',
      name: 'Kavindu Gunathilake',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop',
      module: 'Cloud Architecture',
      score: 89,
      risk: 'low',
      status: 'on_track',
    },
    {
      id: '4',
      studentId: 'IT21099102',
      name: 'Sanduni Fernando',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop',
      module: 'Advanced Databases',
      score: 61,
      risk: 'medium',
      status: 'monitoring',
    },
  ];

  readonly filterForm = this.fb.nonNullable.group({
    module: ['ads', [Validators.required]],
    intake: ['feb-2024', [Validators.required]],
    semester: ['s01', [Validators.required]],
  });

  applyFilters(): void {
    this.filterForm.markAllAsTouched();
    if (this.filterForm.invalid) {
      this.toast.show('Select module, intake, and semester before applying filters.', 'error');
      return;
    }
    this.toast.show('Filters applied.', 'success');
  }
}
