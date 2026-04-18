import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [NgClass, RouterLink],
  template: `
    <div class="w-full space-y-10 pb-12 font-body text-on-surface">
      <!-- Header Section -->
      <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="mb-2 font-headline text-3xl font-extrabold tracking-tight text-[#003f87]">
            Academic Performance Dashboard
          </h1>
          <p class="font-medium text-slate-500">Institutional monitoring for Semester 1, 2024</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            <span class="material-symbols-outlined text-base text-slate-500">calendar_today</span>
            Current Semester
            <span class="material-symbols-outlined text-base text-slate-400">expand_more</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            <span class="material-symbols-outlined text-base text-slate-500">download</span>
            Export CSV
          </button>
        </div>
      </header>

      <!-- KPI Grid — Total Students school icon red; Active Modules menu_book blue (#003f87); red badge on -4.2% -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div
          class="flex min-h-[168px] flex-col justify-between rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgb(0_0_0_/_0.06)] transition-shadow hover:shadow-[0_4px_12px_rgb(0_0_0_/_0.08)]"
        >
          <div class="flex items-start justify-between gap-3">
            <span class="material-symbols-outlined text-[28px] leading-none text-red-600" data-icon="school"
              >school</span
            >
            <span class="shrink-0 text-right text-xs font-bold text-on-surface">+12% vs LY</span>
          </div>
          <div>
            <span class="mb-1 block text-sm font-medium text-[#6B7280]">Total Students</span>
            <h2 class="font-headline text-2xl font-extrabold text-on-surface">2,482</h2>
          </div>
        </div>

        <div
          class="flex min-h-[168px] flex-col justify-between rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgb(0_0_0_/_0.06)] transition-shadow hover:shadow-[0_4px_12px_rgb(0_0_0_/_0.08)]"
        >
          <div class="flex items-start justify-between gap-3">
            <span class="material-symbols-outlined text-[28px] leading-none text-[#003f87]" data-icon="menu_book"
              >menu_book</span
            >
            <span class="shrink-0 text-right text-xs font-bold text-on-surface">Active</span>
          </div>
          <div>
            <span class="mb-1 block text-sm font-medium text-[#6B7280]">Active Modules</span>
            <h2 class="font-headline text-2xl font-extrabold text-on-surface">42</h2>
          </div>
        </div>

        <div
          class="flex min-h-[168px] flex-col justify-between rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgb(0_0_0_/_0.06)] transition-shadow hover:shadow-[0_4px_12px_rgb(0_0_0_/_0.08)]"
        >
          <div class="flex items-start justify-between gap-3">
            <span class="material-symbols-outlined text-[28px] leading-none text-on-surface" data-icon="priority_high"
              >priority_high</span
            >
            <span class="shrink-0 text-right text-xs font-bold text-error">-4.2%</span>
          </div>
          <div>
            <span class="mb-1 block text-sm font-medium text-[#6B7280]">High-Risk Students</span>
            <h2 class="font-headline text-2xl font-extrabold text-on-surface">156</h2>
          </div>
        </div>

        <div
          class="flex min-h-[168px] flex-col justify-between rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgb(0_0_0_/_0.06)] transition-shadow hover:shadow-[0_4px_12px_rgb(0_0_0_/_0.08)]"
        >
          <div class="flex items-start justify-between gap-3">
            <span class="material-symbols-outlined text-[28px] leading-none text-on-surface" data-icon="trending_up"
              >trending_up</span
            >
            <span class="shrink-0 text-right text-xs font-bold text-on-surface">Target: 85%</span>
          </div>
          <div>
            <span class="mb-1 block text-sm font-medium text-[#6B7280]">Avg. Readiness Score</span>
            <h2 class="font-headline text-2xl font-extrabold text-on-surface">78.4%</h2>
          </div>
        </div>
      </div>

      <!-- Charts Bento Grid -->
      <div class="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <!-- Readiness Trend -->
        <div class="rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_2px_12px_rgb(15_23_42_/_0.06)] lg:col-span-2">
          <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h3 class="font-headline text-lg font-bold text-slate-900">Readiness Trend</h3>
            <div class="flex gap-6">
              <span class="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span class="h-2.5 w-2.5 rounded-full bg-[#003f87]"></span>
                2024
              </span>
              <span class="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span class="h-2.5 w-2.5 rounded-full bg-[#b8c9dc]"></span>
                2023
              </span>
            </div>
          </div>

          <div class="flex h-56 items-end justify-between gap-1.5 px-1 sm:gap-3">
            @for (b of readinessBars; track b.label) {
              <div class="flex h-56 min-w-0 flex-1 flex-col items-center justify-end">
                <div class="relative w-full max-w-[3.5rem] flex-1 sm:max-w-none">
                  <!-- Bottom = 2024 (dark blue); top = 2023 (light blue-gray) -->
                  <div
                    class="absolute bottom-0 left-0 right-0 bg-[#003f87]"
                    [style.height.%]="(b.curr / maxReadinessStack) * 100"
                  ></div>
                  <div
                    class="absolute left-0 right-0 rounded-t-[10px] bg-[#b8c9dc]"
                    [style.bottom.%]="(b.curr / maxReadinessStack) * 100"
                    [style.height.%]="(b.prev / maxReadinessStack) * 100"
                  ></div>
                </div>
                <span class="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{{ b.label }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Risk Distribution Pie Chart -->
        <div class="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <div class="mb-8 w-full">
            <h3 class="text-lg font-bold text-[#003f87]">Risk Distribution</h3>
          </div>
          <div class="relative mb-8 h-48 w-48">
            <div class="h-full w-full rounded-full" style="background: conic-gradient(#ba1a1a 0% 15%, #ff9800 15% 45%, #003f87 45% 100%);"></div>
            <div class="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
              <span class="font-headline text-2xl font-extrabold">156</span>
              <span class="mt-1 text-[10px] font-bold text-outline uppercase">TOTAL RISKS</span>
            </div>
          </div>
          <div class="w-full space-y-3">
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <span class="h-3 w-3 rounded-full bg-error"></span>
                <span class="font-medium text-on-surface-variant">Critical Risk</span>
              </div>
              <span class="font-bold">15%</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <span class="h-3 w-3 rounded-full bg-orange-500"></span>
                <span class="font-medium text-on-surface-variant">Elevated Risk</span>
              </div>
              <span class="font-bold">30%</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <span class="h-3 w-3 rounded-full bg-primary"></span>
                <span class="font-medium text-on-surface-variant">Stable</span>
              </div>
              <span class="font-bold">55%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tables & Activity Feed Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Critical Alerts -->
        <div class="space-y-4 lg:col-span-1">
          <div class="mb-1 flex items-center justify-between gap-3">
            <h3 class="font-headline text-lg font-bold text-slate-800">Critical Alerts</h3>
            <span
              class="shrink-0 rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#991b1b]"
              >Action Required</span
            >
          </div>

          <div class="space-y-3">
            <!-- High priority: pale red, thick red left bar, exclamation in red circle -->
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
                  <h4 class="text-sm font-bold text-[#991b1b]">Low Attendance Alert</h4>
                  <p class="mt-1.5 text-sm font-medium leading-snug text-[#b91c1c]">
                    12 students in IT1010 falling below 40% readiness.
                  </p>
                  <a
                    routerLink="/monitoring/intervention-plan"
                    class="mt-3 inline-block text-[11px] font-extrabold uppercase tracking-wide text-[#991b1b] underline-offset-2 hover:underline"
                    >Launch Intervention</a
                  >
                </div>
              </div>
            </div>

            <!-- Standard: white card, grey border, clipboard -->
            <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined mt-0.5 text-[26px] text-orange-500" aria-hidden="true">assignment_late</span>
                <div class="min-w-0 flex-1">
                  <h4 class="text-sm font-bold text-slate-900">Assignment Missed</h4>
                  <p class="mt-1.5 text-sm font-medium leading-snug text-slate-600">
                    Batch 2024.1 S1 - ‘Data structures’ quiz deadline expired.
                  </p>
                  <div class="mt-3 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      class="text-[11px] font-extrabold uppercase tracking-wide text-[#2563eb] hover:underline"
                    >
                      Remind All
                    </button>
                    <button
                      type="button"
                      class="text-[11px] font-extrabold uppercase tracking-wide text-slate-600 hover:text-slate-900"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity Table -->
        <div class="relative lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-8 pb-20 shadow-sm">
          <div class="mb-6 flex items-center justify-between">
            <h3 class="font-headline text-lg font-bold text-[#003f87]">Recent Student Milestones</h3>
            <button type="button" class="text-sm font-bold text-[#003f87] hover:underline">View All</button>
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
                @for (m of milestones; track m.id) {
                  <tr class="group transition-colors hover:bg-slate-50/80">
                    <td class="py-4">
                      <div class="flex items-center gap-3">
                        <div
                          class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600"
                        >
                          {{ m.avatar }}
                        </div>
                        <div>
                          <p class="text-sm font-bold text-slate-900">{{ m.name }}</p>
                          <p class="text-[10px] text-slate-500">{{ m.regNo }}</p>
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
                      {{ m.prevScore }}%
                    </td>
                    <td
                      class="py-4 text-center text-sm font-bold"
                      [ngClass]="{
                        'text-slate-800': m.statusTone === 'neutral',
                        'text-blue-900': m.statusTone === 'success',
                        'text-red-600': m.statusTone === 'danger'
                      }"
                    >
                      {{ m.currScore }}%
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
export class DashboardPageComponent {
  // These values are mock UI data for the dashboard layout.
  // If you later connect APIs, keep the template and replace only these fields.
  get maxReadinessStack(): number {
    return Math.max(...this.readinessBars.map((b) => b.prev + b.curr), 1);
  }

  readonly totalStudents = 2482;
  readonly activeModules = 42;
  readonly highRiskStudents = 156;
  readonly avgReadiness = 78.4;

  readonly studentsMeta = 'Total students monitored';
  readonly studentsChange = '-12%';
  readonly riskChange = '-4.2%';
  readonly readinessChange = '+2.1%';

  readonly readinessBars = [
    { label: 'JAN', prev: 22, curr: 18 },
    { label: 'FEB', prev: 30, curr: 28 },
    { label: 'MAR', prev: 34, curr: 24 },
    { label: 'APR', prev: 45, curr: 40 },
    { label: 'MAY', prev: 55, curr: 62 },
    { label: 'JUN', prev: 50, curr: 58 },
    { label: 'JUL', prev: 48, curr: 64 },
  ] as const;

  readonly milestones = [
    {
      id: 'm-1',
      avatar: 'F',
      name: 'Sandun Perera',
      regNo: 'IT21045230',
      module: 'Algorithm Design',
      prevScore: 42,
      currScore: 68,
      statusLabel: 'IMPROVED',
      statusTone: 'success' as const,
    },
    {
      id: 'm-2',
      avatar: 'T',
      name: 'Tharushi',
      regNo: 'IT20468821',
      module: 'Object Oriented',
      prevScore: 88,
      currScore: 89,
      statusLabel: 'STABLE',
      statusTone: 'neutral' as const,
    },
    {
      id: 'm-3',
      avatar: 'D',
      name: 'Dilhara Silva',
      regNo: 'IT21049902',
      module: 'Network Foundations',
      prevScore: 31,
      currScore: 24,
      statusLabel: 'HIGH RISK',
      statusTone: 'danger' as const,
    },
  ] as const;
}
