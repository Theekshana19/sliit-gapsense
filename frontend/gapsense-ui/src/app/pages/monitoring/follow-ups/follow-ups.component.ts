import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TABLE_FILTER_MAX_LENGTH } from '../../../validators/form-utils';

type FollowUpStatus = 'overdue' | 'pending' | 'completed';

interface FollowUpRow {
  id: string;
  photoUrl: string;
  name: string;
  studentId: string;
  module: string;
  interventionLabel: string;
  interventionIcon: string;
  interventionTone: 'secondary' | 'surface';
  dateLine1: string;
  dateLine1Class: string;
  dateLine2: string;
  dateLine2Class: string;
  status: FollowUpStatus;
  dimmed?: boolean;
  actions: 'check_note' | 'history_only';
}

interface LecturerNote {
  id: string;
  initials: string;
  initialsBg: string;
  lecturer: string;
  student: string;
  timeAgo: string;
  body: string;
}

@Component({
  standalone: true,
  selector: 'app-follow-ups-page',
  imports: [NgClass, FormsModule],
  template: `
    <div class="mx-auto max-w-7xl space-y-0 pb-12 font-body text-on-surface">
      <header class="mb-8 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div class="max-w-xl">
          <h1 class="mb-2 font-headline text-3xl font-extrabold tracking-tight text-[#003f87]">Follow-up Management</h1>
          <p class="text-on-surface-variant">Track and manage academic interventions for high-risk cohorts.</p>
        </div>
        <div class="flex shrink-0 gap-4">
          <div
            class="min-w-[148px] rounded-xl border-l-4 border-error bg-white py-4 pl-4 pr-5 shadow-sm"
          >
            <span class="mb-1 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Overdue</span>
            <span class="font-headline text-3xl font-extrabold text-error">{{ overdueCount }}</span>
          </div>
          <div
            class="min-w-[148px] rounded-xl border-l-4 border-[#003f87] bg-white py-4 pl-4 pr-5 shadow-sm"
          >
            <span class="mb-1 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Pending</span>
            <span class="font-headline text-3xl font-extrabold text-[#003f87]">{{ pendingCount }}</span>
          </div>
        </div>
      </header>

      <section class="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
        <div class="relative min-w-[300px] flex-1">
          <span
            class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-slate-400"
            >search</span
          >
          <input
            type="search"
            name="followUpSearch"
            [(ngModel)]="followUpSearchQuery"
            class="w-full rounded-xl border border-slate-200/80 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#003f87] focus:outline-none focus:ring-2 focus:ring-[#003f87]/20"
            [attr.maxlength]="searchMax"
            placeholder="Search by Student Name or ID..."
            autocomplete="off"
          />
        </div>
        <select
          class="min-w-[160px] rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-600 focus:border-[#003f87] focus:outline-none focus:ring-2 focus:ring-[#003f87]/20"
        >
          <option>All Modules</option>
          <option>CS101: Intro to Algo</option>
          <option>SE302: Architecture</option>
        </select>
        <select
          class="min-w-[160px] rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-600 focus:border-[#003f87] focus:outline-none focus:ring-2 focus:ring-[#003f87]/20"
        >
          <option>All Statuses</option>
          <option>Overdue</option>
          <option>Pending</option>
          <option>Completed</option>
        </select>
        <button
          type="button"
          class="rounded-xl border border-slate-200/80 bg-white p-3 text-[#003f87] shadow-sm transition-colors hover:bg-slate-50"
          aria-label="Filters"
        >
          <span class="material-symbols-outlined">filter_list</span>
        </button>
      </section>

      <section class="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="bg-slate-50/90">
                <th class="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Student</th>
                <th class="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Module</th>
                <th class="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Intervention</th>
                <th class="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Follow-up Date</th>
                <th class="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Status</th>
                <th class="px-6 py-4 text-right text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (row of followUps; track row.id) {
                <tr
                  class="transition-colors hover:bg-slate-50/80"
                  [class.opacity-75]="row.dimmed"
                >
                  <td class="px-6 py-5">
                    <div class="flex items-center gap-3">
                      <div class="flex h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                        <img [src]="row.photoUrl" [alt]="row.name" class="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p class="text-sm font-bold text-[#003f87]">{{ row.name }}</p>
                        <p class="text-xs text-slate-500">{{ row.studentId }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-5">
                    <span class="text-sm font-medium text-slate-800">{{ row.module }}</span>
                  </td>
                  <td class="px-6 py-5">
                    @switch (row.interventionTone) {
                      @case ('secondary') {
                        <span
                          class="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1 text-xs font-semibold text-[#003f87]"
                        >
                          <span class="material-symbols-outlined text-[14px]">{{ row.interventionIcon }}</span>
                          {{ row.interventionLabel }}
                        </span>
                      }
                      @case ('surface') {
                        <span
                          class="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                        >
                          <span class="material-symbols-outlined text-[14px]">{{ row.interventionIcon }}</span>
                          {{ row.interventionLabel }}
                        </span>
                      }
                    }
                  </td>
                  <td class="px-6 py-5">
                    <div class="flex flex-col">
                      <span class="text-sm font-bold" [ngClass]="row.dateLine1Class">{{ row.dateLine1 }}</span>
                      <span class="text-[10px] font-medium" [ngClass]="row.dateLine2Class">{{ row.dateLine2 }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-5">
                    @switch (row.status) {
                      @case ('overdue') {
                        <span
                          class="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700"
                        >
                          Overdue
                        </span>
                      }
                      @case ('pending') {
                        <span
                          class="rounded-full bg-sky-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#003f87]"
                        >
                          Pending
                        </span>
                      }
                      @case ('completed') {
                        <span
                          class="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600"
                        >
                          Completed
                        </span>
                      }
                    }
                  </td>
                  <td class="px-6 py-5 text-right">
                    <div class="flex justify-end gap-2">
                      @if (row.actions === 'check_note') {
                        <button
                          type="button"
                          class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-sky-50 hover:text-[#003f87]"
                          title="Update Status"
                        >
                          <span class="material-symbols-outlined">check_circle</span>
                        </button>
                        <button
                          type="button"
                          class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-sky-50 hover:text-[#003f87]"
                          title="Add Notes"
                        >
                          <span class="material-symbols-outlined">sticky_note_2</span>
                        </button>
                      } @else {
                        <button
                          type="button"
                          class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-sky-50 hover:text-[#003f87]"
                          title="View History"
                        >
                          <span class="material-symbols-outlined">history</span>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <p class="text-xs font-medium text-slate-500">
            Showing <span class="font-bold text-slate-800">4</span> of
            <span class="font-bold text-slate-800">86</span> follow-ups
          </p>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-400"
              disabled
            >
              Previous
            </button>
            <button
              type="button"
              class="rounded-lg bg-[#003f87] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#00306a]"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <section class="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <div class="space-y-5 lg:col-span-2">
          <h3 class="flex items-center gap-2 font-headline text-xl font-bold text-[#003f87]">
            <span class="material-symbols-outlined text-[#003f87]">event_note</span>
            Recent Notes from Lecturers
          </h3>
          <div class="grid gap-4">
            @for (note of lecturerNotes; track note.id) {
              <div class="relative rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm">
                <span class="absolute right-5 top-4 text-[10px] font-bold text-slate-400">{{ note.timeAgo }}</span>
                <div class="flex gap-4 pr-20">
                  <div
                    class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    [ngClass]="note.initialsBg"
                  >
                    {{ note.initials }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800">
                      {{ note.lecturer }}
                      <span class="mx-1 font-normal text-slate-500">on</span>
                      <span class="text-[#003f87]">{{ note.student }}</span>
                    </p>
                    <p class="mt-1 text-sm italic text-slate-600">"{{ note.body }}"</p>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <aside class="space-y-6">
          <h3 class="flex items-center gap-2 font-headline text-xl font-bold text-[#003f87]">
            <span class="material-symbols-outlined text-[#003f87]">auto_graph</span>
            Trend Analysis
          </h3>
          <div
            class="rounded-xl bg-gradient-to-br from-[#003f87] to-[#002d5c] p-6 text-white shadow-lg shadow-[#003f87]/20"
          >
            <p class="mb-4 text-xs font-bold uppercase tracking-widest text-sky-200">Intervention Success</p>
            <div class="mb-4 flex h-32 items-end gap-1">
              <div class="h-[40%] w-full rounded-t-lg bg-white/20"></div>
              <div class="h-[65%] w-full rounded-t-lg bg-white/20"></div>
              <div class="h-[55%] w-full rounded-t-lg bg-white/20"></div>
              <div class="h-[85%] w-full rounded-t-lg bg-sky-300/50"></div>
              <div class="h-[95%] w-full rounded-t-lg bg-white"></div>
            </div>
            <p class="text-sm text-sky-100">
              Completion rate up <span class="font-bold text-white">14%</span> since last month due to automated SMS reminders.
            </p>
          </div>

          <div class="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <h4 class="mb-4 text-sm font-bold uppercase tracking-tight text-slate-800">Active Programs</h4>
            <div class="space-y-4">
              <div>
                <div class="mb-1 flex items-center justify-between">
                  <span class="text-xs font-medium text-slate-500">Tutoring</span>
                  <span class="text-xs font-bold text-slate-800">42 Students</span>
                </div>
                <div class="h-1.5 w-full rounded-full bg-slate-200">
                  <div class="h-1.5 rounded-full bg-[#003f87]" style="width: 75%"></div>
                </div>
              </div>
              <div>
                <div class="mb-1 flex items-center justify-between pt-2">
                  <span class="text-xs font-medium text-slate-500">Peer Mentoring</span>
                  <span class="text-xs font-bold text-slate-800">18 Students</span>
                </div>
                <div class="h-1.5 w-full rounded-full bg-slate-200">
                  <div class="h-1.5 rounded-full bg-slate-500" style="width: 30%"></div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  `,
})
export class FollowUpsPageComponent {
  readonly searchMax = TABLE_FILTER_MAX_LENGTH;
  followUpSearchQuery = '';

  readonly overdueCount = 12;
  readonly pendingCount = 28;

  readonly followUps: FollowUpRow[] = [
    {
      id: '1',
      photoUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD9kxAe1havZt3an9LomDWRp1izxDE64Kn4ao-X76nxxEujusGm9_2ZBYmsPHZGp0reCXGeu_eUhZ-bImR5v3K9t7SoRhecwyXRbjEijqRuOUlAUpCm8DmeKvUznINfhsN5Xd5cfyur7kg50VJpAgDtQJXfXmyozL2tzZpTMXu91iSCEYejlAd0LnEtRbGrfcWUUfhZewEiwaRipOtFG49Fe4R_ENOJzSO6SF4USE0fGUPnf-1hUhuPb3fDgb4OLSh5b9NduwFf9DD9',
      name: 'Arjun Perera',
      studentId: 'IT21004562',
      module: 'Data Structures',
      interventionLabel: '1-on-1 Mentoring',
      interventionIcon: 'school',
      interventionTone: 'secondary',
      dateLine1: 'Oct 24, 2023',
      dateLine1Class: 'text-red-600',
      dateLine2: '3 days ago',
      dateLine2Class: 'text-red-600',
      status: 'overdue',
      actions: 'check_note',
    },
    {
      id: '2',
      photoUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCw12wX2_PhWa3gBXLDzkrhjJUbl3Vuy4MSCef2bC66GNXOIvLwjy2nf6QB0KwcTN_gBOeth92Q6JL_CkrXW5iDNHLTfD0Sv25XGwkVK4Lw47vWe5mkuZoDm6sM-pRJ3xdMCx4nGF6uIujXjggR-9vY5X3zkRBJmJUzLvpJB0EQfD8mp1HYohUGHR0AdWQf53Cvb1lrBQKF_rDRW18Gx9kwcDmBJy3LqT317z3IezbYxZAuE1GymYa71AVUxM8CBrECrPEnArX49GKv',
      name: 'Lakmi De Silva',
      studentId: 'IT21088722',
      module: 'Probability & Stats',
      interventionLabel: 'Mental Wellness Check',
      interventionIcon: 'psychology',
      interventionTone: 'secondary',
      dateLine1: 'Oct 30, 2023',
      dateLine1Class: 'text-[#003f87]',
      dateLine2: 'In 3 days',
      dateLine2Class: 'text-slate-500 uppercase',
      status: 'pending',
      actions: 'check_note',
    },
    {
      id: '3',
      photoUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB2zj2xmfi_BrHOn9XE7AJK6eYwDFgM2RVHCXFyO0ftdaSJbUgELyGglqOHDaqgBWwA-yL3hoCXB_gsVnZGn0bAA6W_tRF4D17uKiJYGpm0XpdHcSlBakQ3zbcUKHs5WxdsbdmUGB-BYYmivD-TX_AH9YkTZLdbhJKROAz8Yp15KrximzqcLS_v_dlhSToSlQku88mL1gCEGDxGK1mlFQWaz8jbdOWKi8x67_V-hAjnlHN9hLhFY8TNuf7mbJcx4gSrkmAYH8ofOyWn',
      name: 'Nimna Gamage',
      studentId: 'IT21123445',
      module: 'Software Architecture',
      interventionLabel: 'Extra Lab Session',
      interventionIcon: 'auto_stories',
      interventionTone: 'surface',
      dateLine1: 'Oct 20, 2023',
      dateLine1Class: 'text-slate-600',
      dateLine2: 'Done',
      dateLine2Class: 'font-bold uppercase text-emerald-600',
      status: 'completed',
      dimmed: true,
      actions: 'history_only',
    },
    {
      id: '4',
      photoUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCH2I2XsXGzZGeFkGLrTB5ys-n6wAkr1QvgOkn5--G0RXv0WRLY8fhCcRGqNHq_yqZqyrCFlhnB0kuF5kBGrtEYVFhbOcmqdM1vS2NPNOS1JrFGZG6m53Ky4x0SE6OiSufRVAECf9ACs2aDqXFcYDV7o3I_mRshvLHOHFIFrHyUTKHY0vuUSiNucEzOm7bXpRzAquv_RCKViAkXrBiFEMpv3BN09NGCzerf_6k7Ln3XsQJYtFEQ9rOxdJldRJkZhE9zDyeWKbUGsvEM',
      name: 'Savindi Perera',
      studentId: 'IT21099231',
      module: 'Operating Systems',
      interventionLabel: 'Assignment Deadline Extension',
      interventionIcon: 'edit_document',
      interventionTone: 'secondary',
      dateLine1: 'Nov 02, 2023',
      dateLine1Class: 'text-[#003f87]',
      dateLine2: 'In 6 days',
      dateLine2Class: 'text-slate-500 uppercase',
      status: 'pending',
      actions: 'check_note',
    },
  ];

  readonly lecturerNotes: LecturerNote[] = [
    {
      id: 'n1',
      initials: 'RS',
      initialsBg: 'bg-sky-100 text-[#003f87]',
      lecturer: 'Dr. Rohana Silva',
      student: 'Arjun Perera',
      timeAgo: '2 HOURS AGO',
      body: 'Student missed the scheduled 1-on-1 session today. Need to re-prioritize contact via mobile.',
    },
    {
      id: 'n2',
      initials: 'AM',
      initialsBg: 'bg-slate-200 text-slate-700',
      lecturer: 'Ms. Anupama',
      student: 'Nimna Gamage',
      timeAgo: 'YESTERDAY',
      body: 'Extra lab session was successful. Student now understands basic routing principles.',
    },
  ];
}
