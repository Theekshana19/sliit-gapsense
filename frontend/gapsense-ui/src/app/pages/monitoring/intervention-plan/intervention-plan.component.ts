import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../components/ui/toast/toast.service';
import type { CourseModuleDto } from '../../../services/optional-modules-api.service';
import {
  InterventionStatus,
  InterventionType,
  RiskGroup,
} from '../../../models/monitoring/monitoring.model';
import { StudentInterventionPlansService } from '../../../services/student-intervention-plans.service';
import { controlInvalid } from '../../../validators/form-utils';
import { futureOrTodayDateValidator } from '../../../validators/forms.validators';

const USER_GUID_PATTERN =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

type PlanMode = 'draft' | 'publish';

@Component({
  standalone: true,
  selector: 'app-intervention-plan-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto w-full max-w-5xl pb-12 pt-2">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav class="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <a routerLink="/monitoring/plans" class="hover:text-[#003f87]">Interventions</a>
            <span class="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
            <span class="text-[#003f87]">New Plan</span>
          </nav>
          <h1 class="mb-2 font-headline text-3xl font-extrabold tracking-tight text-[#003f87]">
            Create New Intervention Plan
          </h1>
          <p class="mt-2 text-base text-slate-600">Define strategies and schedules for academic support.</p>
        </div>
        <div
          class="inline-flex items-center gap-2 self-start rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#003f87]"
        >
          <span class="inline-block h-2 w-2 rounded-full bg-[#003f87]"></span>
          Status: Draft
        </div>
      </div>

      <div class="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/80">
        <div class="h-1.5 w-full bg-[#0047AB]"></div>

        <form class="p-6 sm:p-10" [formGroup]="form" (ngSubmit)="submitPublish()">
          <div class="grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2">
            <!-- Target -->
            <div class="space-y-8">
              <section>
                <h3 class="mb-6 flex items-center gap-2 border-b border-slate-100 pb-2 font-headline text-lg font-bold text-[#003f87]">
                  <span class="material-symbols-outlined text-[#0047AB]">school</span>
                  Target Information
                </h3>
                <div class="space-y-5">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-semibold text-slate-700" for="courseCode">Module</label>
                    <select
                      id="courseCode"
                      formControlName="courseCode"
                      class="w-full appearance-none rounded-xl border bg-white px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0047AB]/35"
                      [class.border-rose-500]="showError('courseCode')"
                      [class.border-slate-200]="!showError('courseCode')"
                    >
                      <option value="" disabled>Select Module</option>
                      @for (m of courseModules(); track m.id) {
                        <option [value]="m.code">{{ m.title }} ({{ m.code }})</option>
                      }
                    </select>
                    @if (showError('courseCode')) {
                      <p class="text-xs font-medium text-rose-600">Select a module.</p>
                    }
                  </div>

                  <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-semibold text-slate-700" for="studentUserId">Student user id (GUID)</label>
                    @if (recentStudentIds().length) {
                      <div class="flex flex-col gap-1">
                        <label class="text-xs font-medium text-slate-600" for="recentStudentPick">Recent students (this module list)</label>
                        <select
                          id="recentStudentPick"
                          class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-mono text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0047AB]/35"
                          (change)="applyRecentStudent($event)"
                        >
                          <option value="">Select to fill the field below…</option>
                          @for (id of recentStudentIds(); track id) {
                            <option [value]="id">{{ id }}</option>
                          }
                        </select>
                      </div>
                    }
                    <input
                      id="studentUserId"
                      type="text"
                      formControlName="studentUserId"
                      list="recent-student-ids"
                      autocomplete="off"
                      placeholder="Paste the student account GUID"
                      class="w-full rounded-xl border bg-white px-4 py-3 font-mono text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0047AB]/35"
                      [class.border-rose-500]="showError('studentUserId')"
                      [class.border-slate-200]="!showError('studentUserId')"
                    />
                    <datalist id="recent-student-ids">
                      @for (id of recentStudentIds(); track id) {
                        <option [value]="id"></option>
                      }
                    </datalist>
                    @if (showError('studentUserId')) {
                      <p class="text-xs font-medium text-rose-600">Enter the student’s account id (GUID).</p>
                    }
                    <p class="text-xs text-slate-500">
                      Use a real account id (version 1–5 UUID). Students you have already created interventions for appear above; otherwise
                      paste an id from staff or analytics tools.
                    </p>
                  </div>

                  <div class="flex flex-col gap-1.5">
                    <span class="text-sm font-semibold text-slate-700">Risk Group</span>
                    <div class="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Risk group">
                      @for (opt of riskOptions; track opt.value) {
                        <label
                          class="flex cursor-pointer items-center justify-center rounded-xl border-2 px-2 py-3 text-center text-sm font-semibold transition"
                          [class.border-rose-400]="form.controls.riskGroup.value === opt.value"
                          [class.bg-rose-50]="form.controls.riskGroup.value === opt.value && opt.value === 'high'"
                          [class.text-rose-700]="form.controls.riskGroup.value === opt.value && opt.value === 'high'"
                          [class.border-amber-300]="form.controls.riskGroup.value === opt.value && opt.value === 'medium'"
                          [class.bg-amber-50]="form.controls.riskGroup.value === opt.value && opt.value === 'medium'"
                          [class.text-amber-800]="form.controls.riskGroup.value === opt.value && opt.value === 'medium'"
                          [class.border-[#0047AB]]="form.controls.riskGroup.value === opt.value && opt.value === 'low'"
                          [class.bg-sky-50]="form.controls.riskGroup.value === opt.value && opt.value === 'low'"
                          [class.text-[#0047AB]]="form.controls.riskGroup.value === opt.value && opt.value === 'low'"
                          [class.border-slate-200]="form.controls.riskGroup.value !== opt.value"
                          [class.bg-slate-50]="form.controls.riskGroup.value !== opt.value"
                          [class.text-slate-600]="form.controls.riskGroup.value !== opt.value"
                        >
                          <input class="sr-only" type="radio" formControlName="riskGroup" [value]="opt.value" />
                          {{ opt.label }}
                        </label>
                      }
                    </div>
                    @if (showError('riskGroup')) {
                      <p class="text-xs font-medium text-rose-600">Choose a risk level.</p>
                    }
                  </div>
                </div>
              </section>

              <section>
                <h3 class="mb-6 flex items-center gap-2 border-b border-slate-100 pb-2 font-headline text-lg font-bold text-[#003f87]">
                  <span class="material-symbols-outlined text-[#0047AB]">topic</span>
                  Content Focus
                </h3>
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-slate-700" for="title">Weak Topic / Focus Area</label>
                  <input
                    id="title"
                    type="text"
                    formControlName="title"
                    autocomplete="off"
                    placeholder="e.g. Memory Management, Normalization"
                    class="w-full rounded-xl border bg-white px-4 py-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0047AB]/35"
                    [class.border-rose-500]="showError('title')"
                    [class.border-slate-200]="!showError('title')"
                  />
                  @if (showError('title')) {
                    <p class="text-xs font-medium text-rose-600">{{ fieldError('title') }}</p>
                  }
                  @if (mode === 'publish' && form.controls.title.touched && !form.controls.title.invalid) {
                    <p class="text-xs text-slate-500">{{ form.controls.title.value.length }} / 200</p>
                  }
                </div>
              </section>
            </div>

            <!-- Plan details -->
            <div class="space-y-8">
              <section>
                <h3 class="mb-6 flex items-center gap-2 border-b border-slate-100 pb-2 font-headline text-lg font-bold text-[#003f87]">
                  <span class="material-symbols-outlined text-[#0047AB]">event_note</span>
                  Plan Details
                </h3>
                <div class="space-y-5">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-semibold text-slate-700" for="interventionType">Intervention Type</label>
                    <select
                      id="interventionType"
                      formControlName="interventionType"
                      class="w-full appearance-none rounded-xl border bg-white px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0047AB]/35"
                      [class.border-rose-500]="showError('interventionType')"
                      [class.border-slate-200]="!showError('interventionType')"
                    >
                      <option value="" disabled>Select Type</option>
                      <option value="extra-support">Extra Support Session</option>
                      <option value="learning-resource">Learning Resource Access</option>
                      <option value="remedial">Remedial Assignment</option>
                      <option value="mentoring">1-on-1 Mentoring</option>
                      <option value="workshop">Special Workshop</option>
                      <option value="tutorial">Extra Tutorial</option>
                      <option value="group-discussion">Group Discussion</option>
                    </select>
                    @if (showError('interventionType')) {
                      <p class="text-xs font-medium text-rose-600">Select an intervention type.</p>
                    }
                  </div>

                  <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-semibold text-slate-700" for="dueDate">Schedule Date</label>
                    <div class="relative">
                      <input
                        id="dueDate"
                        type="date"
                        formControlName="dueDate"
                        class="w-full rounded-xl border bg-white px-4 py-3 pr-12 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0047AB]/35"
                        [class.border-rose-500]="showError('dueDate')"
                        [class.border-slate-200]="!showError('dueDate')"
                      />
                      <span
                        class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined"
                        >calendar_today</span
                      >
                    </div>
                    @if (showError('dueDate')) {
                      <p class="text-xs font-medium text-rose-600">{{ fieldError('dueDate') }}</p>
                    }
                  </div>

                  <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-semibold text-slate-700" for="status">Status</label>
                    <select
                      id="status"
                      formControlName="status"
                      class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0047AB]/35"
                    >
                      <option value="planned">Scheduled</option>
                      <option value="active">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <h3 class="mb-6 flex items-center gap-2 border-b border-slate-100 pb-2 font-headline text-lg font-bold text-[#003f87]">
                  <span class="material-symbols-outlined text-[#0047AB]">notes</span>
                  Administrative Notes
                </h3>
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-slate-700" for="actions">Internal Notes</label>
                  <textarea
                    id="actions"
                    rows="4"
                    formControlName="actions"
                    class="w-full resize-none rounded-xl border bg-white px-4 py-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0047AB]/35"
                    [class.border-rose-500]="showError('actions')"
                    [class.border-slate-200]="!showError('actions')"
                    placeholder="Mention specific pedagogical approaches or resource requirements..."
                  ></textarea>
                  @if (showError('actions')) {
                    <p class="text-xs font-medium text-rose-600">{{ fieldError('actions') }}</p>
                  }
                  <p class="text-xs italic text-slate-500">*These notes are only visible to the administrative team.</p>
                </div>
              </section>
            </div>
          </div>

          <div class="mt-10 flex flex-col gap-4 border-t border-slate-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <a
              routerLink="/monitoring/plans"
              class="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              <span class="material-symbols-outlined text-lg">close</span>
              Cancel
            </a>

            <div class="flex flex-wrap gap-3 sm:justify-end">
              <button
                type="button"
                class="rounded-xl border border-sky-200 bg-sky-50 px-6 py-3 text-sm font-bold text-[#0047AB] shadow-sm transition hover:bg-sky-100"
                (click)="saveDraft()"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                class="inline-flex items-center gap-2 rounded-xl bg-[#0047AB] px-8 py-3 text-sm font-bold text-white shadow-md shadow-[#0047AB]/30 transition hover:bg-[#003a8f]"
              >
                <span class="material-symbols-outlined text-lg">save</span>
                Save Intervention Plan
              </button>
            </div>
          </div>
        </form>
      </div>

      <div class="mt-8 flex items-start gap-4 rounded-2xl border border-sky-100 bg-sky-50/80 p-4 sm:p-6">
        <span class="material-symbols-outlined mt-0.5 text-[#0047AB]">info</span>
        <div>
          <h4 class="mb-1 font-bold text-[#003f87]">Intervention Strategy Tip</h4>
          <p class="text-sm leading-relaxed text-slate-700">
            Plans assigned to &quot;High Risk&quot; groups will automatically notify the respective Course Coordinators and Student Success
            Advisors once marked as &quot;Scheduled&quot;. Ensure all necessary lab resources are booked before finalizing.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class InterventionPlanPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly plansSvc = inject(StudentInterventionPlansService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly courseModules = signal<CourseModuleDto[]>([]);
  readonly recentStudentIds = signal<string[]>([]);

  mode: PlanMode = 'publish';

  readonly riskOptions: { value: RiskGroup; label: string }[] = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  readonly form = this.fb.nonNullable.group({
    courseCode: ['', [Validators.required]],
    studentUserId: ['', [Validators.required, Validators.pattern(USER_GUID_PATTERN)]],
    riskGroup: this.fb.nonNullable.control<RiskGroup>('high', { validators: [Validators.required] }),
    title: [''],
    interventionType: ['', [Validators.required]],
    dueDate: ['', [Validators.required, futureOrTodayDateValidator]],
    status: this.fb.nonNullable.control<InterventionStatus>('planned', { validators: [Validators.required] }),
    actions: [''],
  });

  constructor() {
    this.applyPublishValidators();
  }

  async ngOnInit(): Promise<void> {
    try {
      const [modules, recent] = await Promise.all([
        this.plansSvc.loadCourseModules(),
        this.plansSvc.loadRecentStudentUserIds(),
      ]);
      this.courseModules.set(modules);
      this.recentStudentIds.set(recent);
    } catch {
      try {
        this.courseModules.set(await this.plansSvc.loadCourseModules());
      } catch {
        this.courseModules.set([]);
      }
      this.recentStudentIds.set([]);
    }
  }

  applyRecentStudent(ev: Event): void {
    const el = ev.target as HTMLSelectElement;
    const v = el.value?.trim() ?? '';
    el.value = '';
    if (v) {
      this.form.controls.studentUserId.setValue(v);
    }
  }

  showError(name: keyof typeof this.form.controls): boolean {
    return controlInvalid(this.form.get(name as string), { includeDirty: true });
  }

  fieldError(name: keyof typeof this.form.controls): string {
    const c = this.form.get(name as string);
    if (!c?.errors) {
      return '';
    }
    if (c.errors['required']) {
      return 'This field is required.';
    }
    if (c.errors['minlength']) {
      const req = c.errors['minlength'].requiredLength as number;
      return `Enter at least ${req} characters.`;
    }
    if (c.errors['maxlength']) {
      const req = c.errors['maxlength'].requiredLength as number;
      return `Use at most ${req} characters.`;
    }
    if (c.errors['pastDate']) {
      return 'Choose today or a future date.';
    }
    if (c.errors['pattern']) {
      return 'Enter a valid GUID.';
    }
    return 'Invalid value.';
  }

  async saveDraft(): Promise<void> {
    this.mode = 'draft';
    this.applyDraftValidators();
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.show('Fix the highlighted fields to save a draft.', 'error');
      this.applyPublishValidators();
      this.mode = 'publish';
      return;
    }
    const ok = await this.persistPlan();
    if (!ok) {
      this.toast.show('Could not save draft to the server.', 'error');
      this.applyPublishValidators();
      this.mode = 'publish';
      return;
    }
    this.toast.show('Draft saved.', 'success');
    this.applyPublishValidators();
    this.mode = 'publish';
    void this.router.navigateByUrl('/monitoring/plans');
  }

  async submitPublish(): Promise<void> {
    this.mode = 'publish';
    this.applyPublishValidators();
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.show('Complete required fields and notes before publishing.', 'error');
      return;
    }
    const ok = await this.persistPlan();
    if (!ok) {
      this.toast.show('Could not save intervention. Check student id and try again.', 'error');
      return;
    }
    this.toast.show('Intervention plan saved.', 'success');
    void this.router.navigateByUrl('/monitoring/plans');
  }

  private async persistPlan(): Promise<boolean> {
    const v = this.form.getRawValue();
    const titleTrim = v.title.trim();
    const title = titleTrim || (this.mode === 'draft' ? 'Untitled draft' : titleTrim);
    const actionsTrim = v.actions.trim();
    const administrativeNotes = actionsTrim || (this.mode === 'draft' ? '—' : actionsTrim);
    return this.plansSvc.createFromWizard({
      moduleCode: v.courseCode.trim(),
      studentUserId: v.studentUserId.trim(),
      riskGroup: v.riskGroup,
      title,
      interventionType: v.interventionType as InterventionType,
      dueDate: v.dueDate,
      uiStatus: v.status,
      administrativeNotes,
      isDraft: this.mode === 'draft',
    });
  }

  private applyDraftValidators(): void {
    this.form.controls.title.setValidators([Validators.maxLength(200)]);
    this.form.controls.actions.setValidators([Validators.maxLength(2000)]);
    this.form.controls.title.updateValueAndValidity({ emitEvent: false });
    this.form.controls.actions.updateValueAndValidity({ emitEvent: false });
  }

  private applyPublishValidators(): void {
    this.form.controls.title.setValidators([
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(200),
    ]);
    this.form.controls.actions.setValidators([
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(2000),
    ]);
    this.form.controls.title.updateValueAndValidity({ emitEvent: false });
    this.form.controls.actions.updateValueAndValidity({ emitEvent: false });
  }
}
