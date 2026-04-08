import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../../components/layout/sidebar/sidebar.component';
import { TopBarComponent } from '../../../components/layout/top-bar/top-bar.component';
import { AuthUiService } from '../../../services/auth-ui.service';
import { ReadinessService } from '../../../services/readiness.service';
import { QuizSchedule } from '../../../models/readiness/quiz.model';

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
            >.
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
                Live KPIs and charts are not connected yet. Use the sidebar for readiness, risk, and curriculum tools.
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
            <h2 class="font-headline text-lg font-bold text-slate-900">No institutional metrics loaded</h2>
            <p class="mt-3 text-sm leading-relaxed text-slate-600">
              Previous versions of this page showed sample numbers for layout only. When reporting APIs are available,
              total students, risk counts, and trends can be wired here without changing the navigation structure.
            </p>
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

  readonly isStudent = computed(() => this.authUi.currentUser()?.role === 'student');
  readonly userName = computed(() => this.authUi.currentUser()?.fullName ?? 'Student');

  readonly studentSchedules = signal<QuizSchedule[]>([]);
  readonly schedulesLoading = signal(false);
  readonly schedulesError = signal(false);

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
    if (this.authUi.currentUser()?.role !== 'student') return;

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
  }
}
