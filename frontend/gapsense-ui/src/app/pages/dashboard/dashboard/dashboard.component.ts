import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { SidebarComponent } from '../../../components/layout/sidebar/sidebar.component';
import { TopBarComponent } from '../../../components/layout/top-bar/top-bar.component';
import { AuthUiService } from '../../../services/auth-ui.service';
import { ReadinessService } from '../../../services/readiness.service';
import { OptionalModulesApiService } from '../../../services/optional-modules-api.service';
import { QuizSchedule } from '../../../models/readiness/quiz.model';

type StaffSnapshot = {
  moduleCount: number;
  submissionRecords: number;
  submissionCompletionRate: number;
  openInterventions: number;
  lecturerAssignments: number;
};

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [RouterLink, TopBarComponent, SidebarComponent],
  template: `
    <app-top-bar />
    <app-sidebar />
    <main class="ml-64 min-h-screen bg-slate-50/50 px-8 pb-12 pt-24 font-sans text-slate-900">
      @if (isStudent()) {
        <div class="w-full max-w-4xl space-y-8 pb-12">
          <header>
            <h1 class="mb-2 font-headline text-3xl font-extrabold tracking-tight text-[#003f87]">
              Hello, {{ userName() }}
            </h1>
            <p class="font-medium text-slate-500">
              Readiness quizzes your lecturer has opened for today’s date window appear below. There is no separate
              notification feed yet—use this dashboard or
              <a routerLink="/readiness/available-quizzes" class="font-semibold text-[#003f87] underline-offset-2 hover:underline"
                >Readiness quizzes</a
              >
              in the sidebar.
            </p>
          </header>

          <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 class="font-headline text-lg font-bold text-slate-900">Open readiness quizzes</h2>
              <a
                routerLink="/readiness/available-quizzes"
                class="text-sm font-bold text-[#003f87] hover:underline"
              >
                View all
              </a>
            </div>

            @if (schedulesLoading()) {
              <p class="text-sm text-slate-500">Loading…</p>
            } @else if (schedulesError()) {
              <p class="text-sm text-red-600">Could not load schedules. Check that the API is running.</p>
            } @else if (studentSchedules().length === 0) {
              <p class="text-sm text-slate-600">
                None right now. After your lecturer publishes a schedule and today is between the start and end dates, the
                quiz will show here and under Readiness quizzes.
              </p>
            } @else {
              <ul class="divide-y divide-slate-100">
                @for (s of studentSchedules(); track s.id) {
                  <li class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p class="text-xs font-bold uppercase tracking-wider text-slate-500">{{ s.moduleCode }}</p>
                      <p class="font-headline font-bold text-slate-900">{{ s.quizTitle }}</p>
                      <p class="text-xs text-slate-500">{{ s.startDate }} → {{ s.endDate }}</p>
                    </div>
                    <a
                      [routerLink]="['/readiness/quiz-attempt', s.quizId]"
                      class="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#003f87] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#00306b]"
                    >
                      Start attempt
                    </a>
                  </li>
                }
              </ul>
            }
          </section>

          <section class="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-600">
            <span class="font-headline font-bold text-slate-800">After you submit</span>
            — see scores and history under
            <a routerLink="/readiness/attempt-history" class="font-semibold text-[#003f87] hover:underline"
              >My quiz attempts</a
            >, and your analytics under <strong>Risk analysis</strong> in the sidebar.
          </section>
        </div>
      } @else {
        <div class="w-full max-w-3xl space-y-8 pb-12">
          <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 class="mb-2 font-headline text-3xl font-extrabold tracking-tight text-[#003f87]">
                Academic dashboard
              </h1>
              <p class="font-medium text-slate-500">
                Summary figures below are loaded from the live API for your role.
              </p>
            </div>
            <a
              [routerLink]="quickLink()"
              class="inline-flex items-center gap-2 rounded-xl bg-[#003f87] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#00306b]"
            >
              <span class="material-symbols-outlined text-base">{{ quickLinkIcon() }}</span>
              {{ quickLinkLabel() }}
            </a>
          </header>

          <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 class="font-headline text-lg font-bold text-slate-900">System summary</h2>
            @if (staffSnapshotLoading()) {
              <p class="mt-3 text-sm text-slate-500">Loading summary…</p>
            } @else if (staffSnapshotError()) {
              <p class="mt-3 text-sm text-red-600">Could not load one or more dashboard metrics.</p>
            } @else if (staffSnapshot(); as snap) {
              <ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li><strong>Course modules</strong> in catalogue: {{ snap.moduleCount }}</li>
                <li><strong>Quiz submission records</strong> (all quizzes): {{ snap.submissionRecords }}</li>
                <li><strong>Completion rate</strong> reported for those records: {{ snap.submissionCompletionRate }}%</li>
                <li><strong>Open student interventions</strong> (visible to you): {{ snap.openInterventions }}</li>
                @if (isLecturer()) {
                  <li><strong>Your module assignments</strong>: {{ snap.lecturerAssignments }}</li>
                }
              </ul>
              <p class="mt-4 text-xs text-slate-500">
                Sources: <code>/api/CourseModules</code>, <code>/api/submissions/stats</code>,
                <code>/api/StudentInterventions</code>@if (isLecturer()) {
                , <code>/api/LecturerAssignments</code>}
                .
              </p>
            } @else {
              <p class="mt-3 text-sm text-slate-600">No snapshot loaded.</p>
            }
            <ul class="mt-6 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Lecturers: question bank, quiz builder, and scheduling live under <strong>Readiness</strong>.</li>
              <li>Admins: configure thresholds and rules from the <strong>Risk analysis</strong> entries.</li>
            </ul>
          </div>
        </div>
      }
    </main>
  `,
})
export class DashboardPageComponent implements OnInit {
  private readonly authUi = inject(AuthUiService);
  private readonly readinessService = inject(ReadinessService);
  private readonly optionalModules = inject(OptionalModulesApiService);

  readonly isStudent = computed(() => this.authUi.currentUser()?.role === 'student');
  readonly isLecturer = computed(() => this.authUi.currentUser()?.role === 'lecturer');
  readonly userName = computed(() => this.authUi.currentUser()?.fullName ?? 'Student');

  readonly studentSchedules = signal<QuizSchedule[]>([]);
  readonly schedulesLoading = signal(false);
  readonly schedulesError = signal(false);

  readonly staffSnapshot = signal<StaffSnapshot | null>(null);
  readonly staffSnapshotLoading = signal(false);
  readonly staffSnapshotError = signal(false);

  readonly quickLink = computed(() => {
    const r = this.authUi.currentUser()?.role;
    if (r === 'admin') return '/risk-thresholds';
    return '/readiness-results';
  });

  readonly quickLinkLabel = computed(() => {
    const r = this.authUi.currentUser()?.role;
    if (r === 'admin') return 'Risk thresholds';
    return 'Readiness results';
  });

  readonly quickLinkIcon = computed(() => {
    const r = this.authUi.currentUser()?.role;
    if (r === 'admin') return 'tune';
    return 'fact_check';
  });

  ngOnInit() {
    const role = this.authUi.currentUser()?.role;
    if (role === 'student') {
      this.schedulesLoading.set(true);
      this.readinessService.getSchedules().subscribe({
        next: (list) => {
          this.studentSchedules.set(list);
          this.schedulesLoading.set(false);
        },
        error: () => {
          this.schedulesError.set(true);
          this.schedulesLoading.set(false);
        },
      });
      return;
    }

    if (role === 'admin' || role === 'lecturer') {
      void this.loadStaffSnapshot(role);
    }
  }

  private async loadStaffSnapshot(role: 'admin' | 'lecturer'): Promise<void> {
    this.staffSnapshotLoading.set(true);
    this.staffSnapshotError.set(false);
    try {
      const mods = await this.optionalModules.fetchCourseModules();
      const stats = await firstValueFrom(
        this.readinessService.getSubmissionStats().pipe(catchError(() => of(null)))
      );
      const interventions = await this.optionalModules.fetchInterventions();
      const openInterventions = interventions.filter(
        (i) => (i.status ?? '').toLowerCase() === 'open'
      ).length;

      let lecturerAssignments = 0;
      if (role === 'lecturer') {
        const uid = this.authUi.currentUser()?.userId;
        if (uid) {
          lecturerAssignments = (await this.optionalModules.fetchLecturerAssignments(uid)).length;
        }
      }

      this.staffSnapshot.set({
        moduleCount: mods.length,
        submissionRecords: stats?.totalEnrollments ?? 0,
        submissionCompletionRate: stats?.totalCompletionRate ?? 0,
        openInterventions,
        lecturerAssignments,
      });
    } catch {
      this.staffSnapshotError.set(true);
    } finally {
      this.staffSnapshotLoading.set(false);
    }
  }
}
