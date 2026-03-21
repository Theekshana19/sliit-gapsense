import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmService } from '../../../components/ui/confirm-dialog/confirm.service';
import { ToastService } from '../../../components/ui/toast/toast.service';
import { InterventionPlan } from '../../../models/monitoring/monitoring.model';
import { MonitoringService } from '../../../services/monitoring.service';
import { StatusPillComponent } from '../../../components/ui/status-pill/status-pill.component';

@Component({
  standalone: true,
  selector: 'app-monitoring-plans-page',
  imports: [RouterLink, StatusPillComponent, ReactiveFormsModule],
  template: `
    <div class="mx-auto w-full max-w-7xl space-y-6 pb-8">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="mb-2 font-headline text-3xl font-extrabold tracking-tight text-[#003f87]">Intervention Planning</h1>
          <p class="mt-1 text-lg text-slate-600">Plan and manage academic support strategies for identified cohorts.</p>
        </div>
        <a routerLink="/monitoring/intervention-plan" class="rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow">Add Intervention Plan</a>
      </div>

      <div class="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div class="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-2xl font-semibold text-indigo-900">Active Interventions</h2>
          <div class="relative w-full sm:max-w-xs" [formGroup]="filterForm">
            <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]"
              >search</span
            >
            <input
              type="search"
              formControlName="q"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              [attr.maxlength]="filterMax"
              placeholder="Filter interventions..."
              autocomplete="off"
            />
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3">Module</th>
                <th class="px-4 py-3">Batch</th>
                <th class="px-4 py-3">Risk Group</th>
                <th class="px-4 py-3">Weak Topic</th>
                <th class="px-4 py-3">Type</th>
                <th class="px-4 py-3">Date</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (plan of filteredPlans; track plan.id) {
                <tr>
                  <td class="px-4 py-4 font-medium text-slate-900">{{ plan.courseCode }}</td>
                  <td class="px-4 py-4 text-slate-700">{{ plan.studentRef }}</td>
                  <td class="px-4 py-4"><app-status-pill [label]="riskLabel(plan)" [tone]="riskTone(plan)" /></td>
                  <td class="px-4 py-4 text-slate-700">{{ plan.title }}</td>
                  <td class="px-4 py-4 text-slate-700">{{ interventionTypeLabel(plan.interventionType) }}</td>
                  <td class="px-4 py-4 text-slate-700">{{ plan.dueDate }}</td>
                  <td class="px-4 py-4"><app-status-pill [label]="statusLabel(plan)" [tone]="statusTone(plan)" /></td>
                  <td class="px-4 py-4">
                    <button type="button" class="text-sm font-semibold text-rose-600" (click)="onRemove(plan.id)">Delete</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="px-4 py-10 text-center text-sm text-slate-500">
                    @if (filterQuery().trim()) {
                      No interventions match “{{ filterQuery().trim() }}”. Try another module, batch, or keyword.
                    } @else {
                      No intervention plans yet.
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Intervention Success</p>
          <p class="mt-2 text-4xl font-bold text-slate-900">78.4%</p>
          <p class="mt-3 text-sm text-slate-600">Average improvement rate for students who completed a scheduled intervention module this semester.</p>
          <div class="mt-4 h-3 w-full rounded-full bg-slate-100"><div class="h-3 rounded-full bg-indigo-700" style="width: 78.4%"></div></div>
        </div>
        <div class="rounded-2xl border-l-4 border-rose-600 bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending Actions</p>
          <p class="mt-2 text-4xl font-bold text-rose-700">12 Required</p>
          <ul class="mt-4 space-y-2 text-sm text-slate-700">
            <li>5 High-Risk plans require lecturer assignment</li>
            <li>7 Follow-ups past their scheduled review date</li>
          </ul>
        </div>
      </div>
    </div>
  `,
})
export class MonitoringPlansPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly monitoring = inject(MonitoringService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly filterMax = TABLE_FILTER_MAX_LENGTH;

  readonly filterForm = this.fb.nonNullable.group({
    q: ['', [Validators.maxLength(TABLE_FILTER_MAX_LENGTH)]],
  });

  plans: InterventionPlan[] = this.monitoring.list();

  filterQuery(): string {
    return this.filterForm.controls.q.value;
  }

  get filteredPlans(): InterventionPlan[] {
    const q = this.filterQuery().trim().toLowerCase();
    if (!q) {
      return this.plans;
    }
    return this.plans.filter((plan) => this.planMatchesQuery(plan, q));
  }

  private planMatchesQuery(plan: InterventionPlan, q: string): boolean {
    const haystack = [
      plan.courseCode,
      plan.studentRef,
      plan.title,
      plan.actions,
      plan.dueDate,
      this.interventionTypeLabel(plan.interventionType),
      this.statusLabel(plan),
      this.riskLabel(plan),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  }

  statusLabel(plan: InterventionPlan): string {
    if (plan.status === 'planned') return 'Scheduled';
    if (plan.status === 'active') return 'Active';
    return 'Completed';
  }

  statusTone(plan: InterventionPlan): 'info' | 'warning' | 'success' {
    if (plan.status === 'planned') return 'info';
    if (plan.status === 'active') return 'warning';
    return 'success';
  }

  riskLabel(plan: InterventionPlan): string {
    const g = plan.riskGroup;
    return g === 'high' ? 'High' : g === 'medium' ? 'Medium' : 'Low';
  }

  riskTone(plan: InterventionPlan): 'danger' | 'warning' | 'info' {
    if (plan.riskGroup === 'high') return 'danger';
    if (plan.riskGroup === 'medium') return 'warning';
    return 'info';
  }

  interventionTypeLabel(type: string): string {
    const map: Record<string, string> = {
      'extra-support': 'Extra Support Session',
      'learning-resource': 'Learning Resource Access',
      remedial: 'Remedial Assignment',
      mentoring: '1-on-1 Mentoring',
      workshop: 'Special Workshop',
      tutorial: 'Extra Tutorial',
      'group-discussion': 'Group Discussion',
    };
    return map[type] ?? type;
  }

  async onRemove(id: string): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Remove plan?',
      message: 'This removes the intervention plan from the mock store.',
      confirmLabel: 'Remove',
      cancelLabel: 'Keep',
    });
    if (!ok) return;
    this.monitoring.remove(id);
    this.plans = this.monitoring.list();
    this.toast.show('Plan removed.', 'info');
  }
}
