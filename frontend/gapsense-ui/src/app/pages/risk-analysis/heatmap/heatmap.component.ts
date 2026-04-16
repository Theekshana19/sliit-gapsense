import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { MonitoringActionModalComponent } from '../../../components/monitoring/monitoring-action-modal.component';
import { StudentMonitoringDrawerComponent } from '../../../components/monitoring/student-monitoring-drawer.component';
import { ToastService } from '../../../components/ui/toast/toast.service';
import type {
  MonitoringModalMode,
  MonitoringSummary,
  StudentMonitoringDetails,
  StudentProfileListItem,
} from '../../../models/student-monitoring/student-monitoring.model';
import { downloadHighRiskMonitoringPdf } from '../../../services/high-risk-monitoring-pdf';
import { StudentMonitoringService } from '../../../services/student-monitoring.service';

type RiskFilter = 'all' | 'critical' | 'moderate' | 'low';
type QueueRisk = 'critical' | 'moderate' | 'low';

const PAGE_SIZE = 5;

@Component({
  standalone: true,
  selector: 'app-risk-heatmap-page',
  imports: [StudentMonitoringDrawerComponent, MonitoringActionModalComponent],
  template: `
    <div id="monitoring-print-root" class="mx-auto w-full max-w-[1400px] space-y-8 pb-10 font-body">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 class="mb-2 font-headline text-3xl font-extrabold tracking-tight text-[#003f87]">High-Risk Student Monitoring</h1>
          <p class="mt-2 max-w-2xl text-base text-slate-600">
            Real-time identification of students requiring immediate academic intervention.
          </p>
        </div>
        <div class="flex shrink-0 flex-wrap gap-3">
          <div class="relative">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              (click)="$event.stopPropagation(); filterOpen.set(!filterOpen())"
            >
              <span class="material-symbols-outlined text-[20px] text-slate-500">filter_list</span>
              Filter
            </button>
            @if (filterOpen()) {
              <div
                class="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-2 shadow-lg"
                (click)="$event.stopPropagation()"
              >
                @for (opt of filterOptions; track opt.id) {
                  <button
                    type="button"
                    class="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
                    [class.font-bold]="riskFilter() === opt.id"
                    [class.text-[#003f87]]="riskFilter() === opt.id"
                    (click)="setFilter(opt.id)"
                  >
                    {{ opt.label }}
                  </button>
                }
              </div>
            }
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#003f87] shadow-sm transition hover:bg-sky-50 disabled:pointer-events-none disabled:opacity-40"
            [disabled]="exportPdfDisabled()"
            (click)="exportPdf()"
          >
            @if (exportingPdf()) {
              <span class="material-symbols-outlined animate-pulse text-[20px]">hourglass_empty</span>
              Exporting…
            } @else {
              <span class="material-symbols-outlined text-[20px]">picture_as_pdf</span>
              Export PDF
            }
          </button>
        </div>
      </div>

      @if (pageError()) {
        <div class="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
          {{ pageError() }}
        </div>
      }

      <div class="grid gap-4 md:grid-cols-3">
        <div
          class="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-200/40 ring-1 ring-slate-100"
        >
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
            <span class="material-symbols-outlined text-[28px]">report</span>
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-slate-500">Critical Risk Cases</p>
            <p class="mt-1 font-headline text-3xl font-extrabold text-[#1a2b4b]">{{ summary()?.criticalRiskCases ?? '—' }}</p>
            <p class="mt-2 text-xs font-medium text-slate-500">From active monitoring cohort</p>
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
            <p class="mt-1 font-headline text-3xl font-extrabold text-[#1a2b4b]">{{ summary()?.activeInterventions ?? '—' }}</p>
            <p class="mt-2 text-xs font-medium text-slate-500">Planned or active assignments</p>
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
            <p class="mt-1 font-headline text-3xl font-extrabold text-[#1a2b4b]">{{ summary()?.studentsRecovered ?? '—' }}</p>
            <p class="mt-2 text-xs font-medium text-slate-500">
              Success rate <span class="font-semibold text-[#003f87]">{{ summary()?.successRatePercent ?? '—' }}%</span>
            </p>
          </div>
        </div>
      </div>

      <section class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
        <div class="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="font-headline text-lg font-bold text-[#1a2b4b]">Monitoring Queue</h2>
          <p class="text-sm text-slate-500">
            Showing <span class="font-semibold text-slate-800">{{ pageRows().length }}</span> of
            {{ filteredStudents().length }} students
            @if (summary(); as s) {
              <span class="text-slate-400"> · {{ s.totalHighRiskMonitored }} at-risk monitored</span>
            }
          </p>
        </div>
        @if (tableLoading()) {
          <div class="px-5 py-16 text-center text-sm text-slate-500">Loading queue…</div>
        } @else {
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
                @for (row of pageRows(); track row.id) {
                  <tr [class]="normalizeRisk(row.riskLevel) === 'critical' ? 'bg-rose-50/50' : ''">
                    <td class="whitespace-nowrap px-5 py-4 font-semibold text-[#003f87]">{{ row.studentId }}</td>
                    <td class="px-5 py-4">
                      <div class="flex items-center gap-3">
                        <div
                          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          [style.background]="avatarBg(row.id)"
                        >
                          {{ initials(row.fullName) }}
                        </div>
                        <span class="font-medium text-slate-900">{{ row.fullName }}</span>
                      </div>
                    </td>
                    <td class="px-5 py-4 text-slate-700">{{ row.currentModule }}</td>
                    <td class="px-5 py-4">
                      @switch (normalizeRisk(row.riskLevel)) {
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
                        @for (t of row.weakTopicNames; track t) {
                          <span class="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200/80">{{
                            t
                          }}</span>
                        }
                      </div>
                    </td>
                    <td class="px-5 py-4 text-right">
                      <div class="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          class="text-xs font-bold uppercase tracking-wide text-[#003f87] hover:underline"
                          (click)="viewDetails(row)"
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          class="rounded-lg bg-[#003f87] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110"
                          (click)="openAssign(row.id)"
                        >
                          Assign
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-5 py-10 text-center text-sm text-slate-500">No students match the current filter.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
        <div class="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row">
          <button
            type="button"
            class="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-[#003f87] disabled:opacity-40"
            [disabled]="currentPage() <= 0"
            (click)="prevPage()"
          >
            <span class="material-symbols-outlined text-[20px]">chevron_left</span>
            Previous
          </button>
          <div class="flex items-center gap-2">
            @for (p of pageNumbers(); track p) {
              <button
                type="button"
                [class]="
                  p === currentPage()
                    ? 'flex h-9 min-w-[2.25rem] items-center justify-center rounded-full bg-[#003f87] text-sm font-bold text-white shadow'
                    : 'flex h-9 min-w-[2.25rem] items-center justify-center rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100'
                "
                (click)="goPage(p)"
              >
                {{ p + 1 }}
              </button>
            }
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-[#003f87]"
            [disabled]="currentPage() >= totalPages() - 1"
            (click)="nextPage()"
          >
            Next
            <span class="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </section>

      <div class="grid gap-6 lg:grid-cols-2">
        <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-200/40">
          <h3 class="font-headline text-lg font-bold text-[#1a2b4b]">High-Risk Module Distribution</h3>
          <div class="mt-6 space-y-5">
            @for (m of summary()?.moduleRiskBars ?? []; track m.label) {
              <div>
                <div class="mb-2 flex items-center justify-between text-sm">
                  <span class="font-medium text-slate-800">{{ m.label }}</span>
                  <span [class]="m.isHigh ? 'font-bold text-rose-700' : 'font-bold text-[#003f87]'"
                    >{{ m.pct }}% Failure Risk</span
                  >
                </div>
                <div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    class="h-full rounded-full transition-all"
                    [class]="m.isHigh ? 'bg-rose-600' : 'bg-[#003f87]'"
                    [style.width.%]="m.pct"
                  ></div>
                </div>
              </div>
            } @empty {
              <p class="text-sm text-slate-500">No module data yet.</p>
            }
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-200/40">
          <h3 class="font-headline text-lg font-bold text-[#1a2b4b]">Suggested Interventions</h3>
          <div class="mt-6 space-y-4">
            @for (s of summary()?.suggestedInterventions ?? []; track s.title) {
              <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 ring-1 ring-slate-100">
                <p class="font-headline font-bold text-[#003f87]">{{ s.title }}</p>
                <p class="mt-2 text-sm leading-relaxed text-slate-600">
                  {{ s.description }}
                </p>
              </div>
            } @empty {
              <p class="text-sm text-slate-500">No suggestions loaded.</p>
            }
          </div>
        </section>
      </div>
    </div>

    <app-student-monitoring-drawer
      [open]="drawerOpen()"
      [loading]="drawerLoading()"
      [error]="drawerError()"
      [details]="drawerDetails()"
      (closed)="closeDrawer()"
      (dataChanged)="onDrawerDataChanged()"
      (requestAssign)="openModal('assign')"
      (requestNote)="openModal('note')"
      (requestMeeting)="openModal('meeting', { meetingType: 'follow-up' })"
      (requestReferral)="openModal('referral', { referralType: 'counselor' })"
    />

    <app-monitoring-action-modal
      [open]="modalOpen()"
      [mode]="modalMode()"
      [studentProfileId]="modalStudentId()"
      [meetingPresetType]="meetingPreset()"
      [referralPresetType]="referralPreset()"
      (close)="closeModal()"
      (saved)="onModalSaved()"
    />
  `,
})
export class RiskHeatmapPageComponent {
  private readonly api = inject(StudentMonitoringService);
  private readonly toast = inject(ToastService);

  readonly filterOptions: { id: RiskFilter; label: string }[] = [
    { id: 'all', label: 'All students' },
    { id: 'critical', label: 'Critical only' },
    { id: 'moderate', label: 'Moderate only' },
    { id: 'low', label: 'Low risk only' },
  ];

  readonly students = signal<StudentProfileListItem[]>([]);
  readonly summary = signal<MonitoringSummary | null>(null);
  readonly pageError = signal<string | null>(null);
  readonly tableLoading = signal(true);

  readonly riskFilter = signal<RiskFilter>('all');
  readonly filterOpen = signal(false);
  readonly currentPage = signal(0);

  readonly drawerOpen = signal(false);
  readonly drawerLoading = signal(false);
  readonly drawerError = signal<string | null>(null);
  readonly drawerDetails = signal<StudentMonitoringDetails | null>(null);
  private drawerStudentId: string | null = null;

  readonly modalOpen = signal(false);
  readonly modalMode = signal<MonitoringModalMode | null>(null);
  readonly modalStudentId = signal<string | null>(null);
  readonly meetingPreset = signal<string | null>(null);
  readonly referralPreset = signal<string | null>(null);

  readonly filteredStudents = computed(() => {
    const all = this.students();
    const f = this.riskFilter();
    if (f === 'all') {
      return all;
    }
    return all.filter((s) => this.normalizeRisk(s.riskLevel) === f);
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredStudents().length / PAGE_SIZE)));

  readonly pageRows = computed(() => {
    const list = this.filteredStudents();
    const page = this.currentPage();
    const start = page * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  });

  readonly pageNumbers = computed(() => {
    const n = this.totalPages();
    return Array.from({ length: n }, (_, i) => i);
  });

  /** True while the PDF library is building the file (keeps UI responsive via microtask). */
  readonly exportingPdf = signal(false);

  readonly exportPdfDisabled = computed(
    () => this.tableLoading() || this.filteredStudents().length === 0 || !!this.pageError(),
  );

  readonly activeFilterLabel = computed(() => {
    const id = this.riskFilter();
    return this.filterOptions.find((o) => o.id === id)?.label ?? 'All students';
  });

  constructor() {
    this.reloadAll();
  }

  @HostListener('document:click')
  onDocClick(): void {
    this.filterOpen.set(false);
  }

  @HostListener('document:keydown', ['$event'])
  onDocKey(ev: KeyboardEvent): void {
    if (ev.key !== 'Escape') {
      return;
    }
    if (this.modalOpen()) {
      this.closeModal();
    } else if (this.drawerOpen()) {
      this.closeDrawer();
    }
  }

  setFilter(id: RiskFilter): void {
    this.riskFilter.set(id);
    this.currentPage.set(0);
    this.filterOpen.set(false);
  }

  prevPage(): void {
    this.currentPage.update((p) => Math.max(0, p - 1));
  }

  nextPage(): void {
    this.currentPage.update((p) => Math.min(this.totalPages() - 1, p + 1));
  }

  goPage(p: number): void {
    this.currentPage.set(p);
  }

  normalizeRisk(level: string): QueueRisk {
    const v = level?.toLowerCase() ?? '';
    if (v === 'critical' || v === 'moderate' || v === 'low') {
      return v;
    }
    return 'moderate';
  }

  initials(name: string): string {
    const p = name.trim().split(/\s+/).filter(Boolean);
    if (p.length === 0) {
      return '?';
    }
    if (p.length === 1) {
      return p[0].slice(0, 2).toUpperCase();
    }
    return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  }

  avatarBg(seed: string): string {
    const palette = ['#003f87', '#64748b', '#0d9488', '#7c3aed', '#c2410c', '#0369a1'];
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = (h + seed.charCodeAt(i) * (i + 1)) % palette.length;
    }
    return palette[h];
  }

  viewDetails(row: StudentProfileListItem): void {
    this.drawerStudentId = row.id;
    this.drawerOpen.set(true);
    this.drawerLoading.set(true);
    this.drawerError.set(null);
    this.drawerDetails.set(null);
    this.modalStudentId.set(row.id);
    this.api.getStudentDetails(row.id).subscribe({
      next: (d) => {
        this.drawerDetails.set(d);
        this.drawerLoading.set(false);
      },
      error: (e: Error) => {
        this.drawerError.set(e.message);
        this.drawerLoading.set(false);
      },
    });
  }

  openAssign(id: string): void {
    this.modalStudentId.set(id);
    this.drawerStudentId = id;
    this.openModal('assign');
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.drawerDetails.set(null);
    this.drawerError.set(null);
    this.drawerStudentId = null;
  }

  onDrawerDataChanged(): void {
    this.reloadAll();
    const id = this.drawerStudentId;
    if (id && this.drawerOpen()) {
      this.api.getStudentDetails(id).subscribe({
        next: (d) => this.drawerDetails.set(d),
        error: () => {},
      });
    }
  }

  openModal(mode: MonitoringModalMode, presets?: { meetingType?: string; referralType?: string }): void {
    const sid = this.modalStudentId() ?? this.drawerStudentId;
    if (!sid) {
      this.toast.show('Select a student first.', 'info');
      return;
    }
    this.modalStudentId.set(sid);
    this.modalMode.set(mode);
    this.meetingPreset.set(presets?.meetingType ?? null);
    this.referralPreset.set(presets?.referralType ?? null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.modalMode.set(null);
    this.meetingPreset.set(null);
    this.referralPreset.set(null);
  }

  onModalSaved(): void {
    this.reloadAll();
    const id = this.drawerStudentId;
    if (id && this.drawerOpen()) {
      this.api.getStudentDetails(id).subscribe({
        next: (d) => this.drawerDetails.set(d),
        error: () => {},
      });
    }
  }

  reloadAll(): void {
    this.tableLoading.set(true);
    this.pageError.set(null);
    this.api.getMonitoringSummary().subscribe({
      next: (s) => this.summary.set(s),
      error: (e: Error) => this.pageError.set(e.message),
    });
    this.api.listStudentProfiles().subscribe({
      next: (list) => {
        this.students.set(list);
        this.tableLoading.set(false);
        const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
        if (this.currentPage() >= pages) {
          this.currentPage.set(0);
        }
      },
      error: (e: Error) => {
        this.pageError.set(e.message);
        this.tableLoading.set(false);
      },
    });
  }

  exportPdf(): void {
    if (this.exportPdfDisabled()) {
      this.toast.show('No monitoring data to export right now. Try another filter or wait for the queue to load.', 'info');
      return;
    }
    this.exportingPdf.set(true);
    queueMicrotask(() => {
      try {
        downloadHighRiskMonitoringPdf({
          summary: this.summary(),
          students: this.filteredStudents(),
          filterLabel: this.activeFilterLabel(),
        });
      } catch {
        this.toast.show('Could not generate the PDF. Please try again.', 'error');
      } finally {
        this.exportingPdf.set(false);
      }
    });
  }
}
