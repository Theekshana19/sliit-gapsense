import { Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { Observable } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../ui/toast/toast.service';
import type { MonitoringModalMode } from '../../models/student-monitoring/student-monitoring.model';
import { StudentMonitoringService } from '../../services/student-monitoring.service';
import { SessionService } from '../../services/session.service';
import { controlInvalid } from '../../validators/form-utils';

@Component({
  standalone: true,
  selector: 'app-monitoring-action-modal',
  imports: [ReactiveFormsModule],
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"
        role="presentation"
        (click)="onBackdrop($event)"
      >
        <div
          class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          role="dialog"
          aria-modal="true"
          (click)="$event.stopPropagation()"
        >
          <div class="mb-4 flex items-start justify-between gap-3">
            <h3 class="font-headline text-lg font-bold text-[#1a2b4b]">{{ title() }}</h3>
            <button
              type="button"
              class="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              (click)="close.emit()"
              aria-label="Close"
            >
              <span class="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          @if (mode() === 'assign') {
            <form [formGroup]="assignForm" (ngSubmit)="submitAssign()" class="space-y-4">
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Assign to name</label>
                <input
                  formControlName="assignedToName"
                  class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  autocomplete="name"
                />
                @if (showFieldError(assignForm.get('assignedToName'))) {
                  <p class="mt-1 text-xs text-rose-600">Required</p>
                }
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Role</label>
                <input formControlName="assignedToRole" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                @if (showFieldError(assignForm.get('assignedToRole'))) {
                  <p class="mt-1 text-xs text-rose-600">Required</p>
                }
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Intervention type</label>
                <select formControlName="interventionType" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <option value="remedial">Remedial</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="workshop">Workshop</option>
                  <option value="extra-support">Extra support</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Priority</label>
                <select formControlName="priority" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Due date</label>
                <input type="date" formControlName="dueDate" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                @if (showFieldError(assignForm.get('dueDate'))) {
                  <p class="mt-1 text-xs text-rose-600">Required</p>
                }
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Follow-up date (optional)</label>
                <input type="date" formControlName="followUpDate" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Note</label>
                <textarea formControlName="note" rows="3" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"></textarea>
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Status</label>
                <select formControlName="status" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                </select>
              </div>
              <div class="flex justify-end gap-2 pt-2">
                <button type="button" class="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50" (click)="close.emit()">
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="assignForm.invalid || submitting()"
                  class="rounded-xl bg-[#003f87] px-5 py-2 text-sm font-bold text-white shadow-sm disabled:opacity-50"
                >
                  {{ submitting() ? 'Saving…' : 'Save assignment' }}
                </button>
              </div>
            </form>
          }

          @if (mode() === 'note') {
            <form [formGroup]="noteForm" (ngSubmit)="submitNote()" class="space-y-4">
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Note type</label>
                <select formControlName="noteType" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="follow-up">Follow-up</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Note</label>
                <textarea formControlName="noteText" rows="4" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"></textarea>
                @if (showFieldError(noteForm.get('noteText'))) {
                  <p class="mt-1 text-xs text-rose-600">Required (max 4000 characters)</p>
                }
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Added by</label>
                <input formControlName="addedBy" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                @if (showFieldError(noteForm.get('addedBy'))) {
                  <p class="mt-1 text-xs text-rose-600">Required</p>
                }
              </div>
              <div class="flex justify-end gap-2 pt-2">
                <button type="button" class="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50" (click)="close.emit()">
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="noteForm.invalid || submitting()"
                  class="rounded-xl bg-[#003f87] px-5 py-2 text-sm font-bold text-white shadow-sm disabled:opacity-50"
                >
                  {{ submitting() ? 'Saving…' : 'Save note' }}
                </button>
              </div>
            </form>
          }

          @if (mode() === 'meeting') {
            <form [formGroup]="meetingForm" (ngSubmit)="submitMeeting()" class="space-y-4">
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Title</label>
                <input formControlName="title" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                @if (showFieldError(meetingForm.get('title'))) {
                  <p class="mt-1 text-xs text-rose-600">Required</p>
                }
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Description</label>
                <textarea formControlName="description" rows="3" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"></textarea>
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Scheduled (local)</label>
                <input type="datetime-local" formControlName="scheduledDate" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                @if (showFieldError(meetingForm.get('scheduledDate'))) {
                  <p class="mt-1 text-xs text-rose-600">Required</p>
                }
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Meeting type</label>
                <select formControlName="meetingType" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="review">Review</option>
                  <option value="counseling">Counseling</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Status</label>
                <select formControlName="status" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Created by</label>
                <input formControlName="createdBy" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div class="flex justify-end gap-2 pt-2">
                <button type="button" class="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50" (click)="close.emit()">
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="meetingForm.invalid || submitting()"
                  class="rounded-xl bg-[#003f87] px-5 py-2 text-sm font-bold text-white shadow-sm disabled:opacity-50"
                >
                  {{ submitting() ? 'Saving…' : 'Schedule' }}
                </button>
              </div>
            </form>
          }

          @if (mode() === 'referral') {
            <form [formGroup]="referralForm" (ngSubmit)="submitReferral()" class="space-y-4">
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Referral type</label>
                <select formControlName="referralType" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <option value="counselor">Counselor</option>
                  <option value="academic">Academic</option>
                  <option value="escalation">Escalation</option>
                  <option value="welfare">Welfare</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Referred to</label>
                <input formControlName="referredTo" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                @if (showFieldError(referralForm.get('referredTo'))) {
                  <p class="mt-1 text-xs text-rose-600">Required</p>
                }
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Reason</label>
                <textarea formControlName="reason" rows="4" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"></textarea>
                @if (showFieldError(referralForm.get('reason'))) {
                  <p class="mt-1 text-xs text-rose-600">Required</p>
                }
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Status</label>
                <select formControlName="status" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <option value="pending">Pending</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="in-progress">In progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Created by</label>
                <input formControlName="createdBy" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div class="flex justify-end gap-2 pt-2">
                <button type="button" class="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50" (click)="close.emit()">
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="referralForm.invalid || submitting()"
                  class="rounded-xl bg-[#003f87] px-5 py-2 text-sm font-bold text-white shadow-sm disabled:opacity-50"
                >
                  {{ submitting() ? 'Saving…' : 'Submit referral' }}
                </button>
              </div>
            </form>
          }
        </div>
      </div>
    }
  `,
})
export class MonitoringActionModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(StudentMonitoringService);
  private readonly toast = inject(ToastService);
  private readonly session = inject(SessionService);

  readonly showFieldError = controlInvalid;

  readonly open = input(false);
  readonly mode = input<MonitoringModalMode | null>(null);
  readonly studentProfileId = input<string | null>(null);
  readonly meetingPresetType = input<string | null>(null);
  readonly referralPresetType = input<string | null>(null);

  readonly close = output<void>();
  readonly saved = output<void>();

  readonly submitting = signal(false);

  readonly assignForm = this.fb.nonNullable.group({
    assignedToName: ['', Validators.required],
    assignedToRole: ['Lecturer', Validators.required],
    interventionType: ['remedial', Validators.required],
    priority: ['high', Validators.required],
    dueDate: ['', Validators.required],
    followUpDate: [''],
    note: [''],
    status: ['planned', Validators.required],
  });

  readonly noteForm = this.fb.nonNullable.group({
    noteType: ['general', Validators.required],
    noteText: ['', [Validators.required, Validators.maxLength(4000)]],
    addedBy: ['', Validators.required],
  });

  readonly meetingForm = this.fb.nonNullable.group({
    title: ['Academic support meeting', Validators.required],
    description: [''],
    scheduledDate: ['', Validators.required],
    meetingType: ['follow-up', Validators.required],
    status: ['scheduled', Validators.required],
    createdBy: ['', Validators.required],
  });

  readonly referralForm = this.fb.nonNullable.group({
    referralType: ['counselor', Validators.required],
    referredTo: ['', Validators.required],
    reason: ['', Validators.required],
    status: ['pending', Validators.required],
    createdBy: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const isOpen = this.open();
      const m = this.mode();
      if (!isOpen || !m) {
        return;
      }
      untracked(() => this.resetForms(m));
    });
  }

  title(): string {
    switch (this.mode()) {
      case 'assign':
        return 'Assign support / intervention';
      case 'note':
        return 'Add monitoring note';
      case 'meeting':
        return 'Schedule meeting / follow-up';
      case 'referral':
        return 'Refer counselor / escalation';
      default:
        return 'Action';
    }
  }

  onBackdrop(ev: MouseEvent): void {
    if (ev.target === ev.currentTarget) {
      this.close.emit();
    }
  }

  private resetForms(m: MonitoringModalMode): void {
    const userName = this.session.getUser()?.name?.trim() || 'Lecturer';
    this.assignForm.reset({
      assignedToName: '',
      assignedToRole: 'Senior Lecturer',
      interventionType: 'remedial',
      priority: 'high',
      dueDate: this.toDateInput(new Date(Date.now() + 86400000 * 7)),
      followUpDate: '',
      note: '',
      status: 'planned',
    });
    this.noteForm.reset({
      noteType: 'general',
      noteText: '',
      addedBy: userName,
    });
    const presetMeet = this.meetingPresetType();
    this.meetingForm.reset({
      title: presetMeet === 'follow-up' ? 'Follow-up check-in' : 'Academic support meeting',
      description: '',
      scheduledDate: this.toDateTimeLocal(new Date(Date.now() + 86400000 * 2)),
      meetingType: presetMeet || 'follow-up',
      status: 'scheduled',
      createdBy: userName,
    });
    const presetRef = this.referralPresetType();
    this.referralForm.reset({
      referralType: presetRef || 'counselor',
      referredTo: presetRef === 'escalation' ? 'Head of Department' : 'Student Counselling Unit',
      reason: '',
      status: 'pending',
      createdBy: userName,
    });
  }

  submitAssign(): void {
    if (this.assignForm.invalid) {
      this.assignForm.markAllAsTouched();
      return;
    }
    const sid = this.studentProfileId();
    if (!sid) {
      return;
    }
    const v = this.assignForm.getRawValue();
    const due = this.dateInputToIso(v.dueDate);
    const fu = v.followUpDate ? this.dateInputToIso(v.followUpDate) : null;
    if (fu && new Date(fu) < new Date(due)) {
      this.toast.show('Follow-up date must be on or after due date.', 'error');
      return;
    }
    this.run(
      this.api.createIntervention({
        studentProfileId: sid,
        assignedToName: v.assignedToName.trim(),
        assignedToRole: v.assignedToRole.trim(),
        interventionType: v.interventionType,
        priority: v.priority,
        note: v.note.trim() || null,
        dueDate: due,
        followUpDate: fu,
        status: v.status,
      }),
    );
  }

  submitNote(): void {
    if (this.noteForm.invalid) {
      this.noteForm.markAllAsTouched();
      return;
    }
    const sid = this.studentProfileId();
    if (!sid) {
      return;
    }
    const v = this.noteForm.getRawValue();
    this.run(
      this.api.createNote({
        studentProfileId: sid,
        noteType: v.noteType,
        noteText: v.noteText.trim(),
        addedBy: v.addedBy.trim(),
      }),
    );
  }

  submitMeeting(): void {
    if (this.meetingForm.invalid) {
      this.meetingForm.markAllAsTouched();
      return;
    }
    const sid = this.studentProfileId();
    if (!sid) {
      return;
    }
    const v = this.meetingForm.getRawValue();
    const iso = this.dateTimeLocalToIso(v.scheduledDate);
    if (!iso) {
      this.toast.show('Invalid date/time.', 'error');
      return;
    }
    this.run(
      this.api.createMeeting({
        studentProfileId: sid,
        title: v.title.trim(),
        description: v.description.trim() || null,
        scheduledDate: iso,
        meetingType: v.meetingType,
        status: v.status,
        createdBy: v.createdBy.trim(),
      }),
    );
  }

  submitReferral(): void {
    if (this.referralForm.invalid) {
      this.referralForm.markAllAsTouched();
      return;
    }
    const sid = this.studentProfileId();
    if (!sid) {
      return;
    }
    const v = this.referralForm.getRawValue();
    this.run(
      this.api.createReferral({
        studentProfileId: sid,
        referralType: v.referralType,
        referredTo: v.referredTo.trim(),
        reason: v.reason.trim(),
        status: v.status,
        createdBy: v.createdBy.trim(),
      }),
    );
  }

  private run(req: Observable<unknown>): void {
    this.submitting.set(true);
    req.subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.show('Saved successfully.', 'success');
        this.saved.emit();
        this.close.emit();
      },
      error: (e: Error) => {
        this.submitting.set(false);
        this.toast.show(e.message || 'Save failed', 'error');
      },
    });
  }

  private toDateInput(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private toDateTimeLocal(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private dateInputToIso(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00.000Z');
    return d.toISOString();
  }

  private dateTimeLocalToIso(local: string): string | null {
    const d = new Date(local);
    if (Number.isNaN(d.getTime())) {
      return null;
    }
    return d.toISOString();
  }
}
