import { SlicePipe } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { ToastService } from '../ui/toast/toast.service';
import type {
  InterventionAssignmentDto,
  MeetingDto,
  ReferralDto,
  StudentMonitoringDetails,
} from '../../models/student-monitoring/student-monitoring.model';
import type { UpdateInterventionAssignmentPayload, UpdateMeetingPayload, UpdateReferralPayload } from '../../models/student-monitoring/student-monitoring.model';
import { SessionService } from '../../services/session.service';
import { StudentMonitoringService } from '../../services/student-monitoring.service';

@Component({
  standalone: true,
  selector: 'app-student-monitoring-drawer',
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 bg-slate-900/40 transition-opacity"
        role="presentation"
        (click)="onBackdrop($event)"
      ></div>
      <aside
        class="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
        (click)="$event.stopPropagation()"
        aria-label="Student details"
      >
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 class="font-headline text-lg font-bold text-[#1a2b4b]">Student details</h2>
          <button
            type="button"
            class="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            (click)="closed.emit()"
            aria-label="Close drawer"
          >
            <span class="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          @if (loading()) {
            <div class="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
              <span class="material-symbols-outlined animate-pulse text-4xl text-[#003f87]">hourglass_top</span>
              <p class="text-sm font-medium">Loading student record…</p>
            </div>
          } @else if (error()) {
            <p class="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">{{ error() }}</p>
          } @else if (d()) {
            <div class="space-y-6">
              <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 ring-1 ring-slate-100">
                <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Profile</p>
                <p class="mt-1 font-headline text-xl font-bold text-[#003f87]">{{ d()!.fullName }}</p>
                <p class="text-sm text-slate-600">{{ d()!.studentId }} · {{ d()!.email }}</p>
                @if (d()!.phone) {
                  <p class="text-sm text-slate-600">{{ d()!.phone }}</p>
                }
                <p class="mt-2 text-sm text-slate-600">{{ d()!.degreeProgram }}</p>
                <p class="text-sm text-slate-600">{{ d()!.batch }} · Year {{ d()!.year }} · {{ d()!.semester }}</p>
              </div>

              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="rounded-xl border border-slate-100 bg-white p-3">
                  <p class="text-[10px] font-bold uppercase text-slate-500">GPA</p>
                  <p class="font-headline text-lg font-bold text-[#1a2b4b]">{{ d()!.gpa }}</p>
                </div>
                <div class="rounded-xl border border-slate-100 bg-white p-3">
                  <p class="text-[10px] font-bold uppercase text-slate-500">Attendance</p>
                  <p class="font-headline text-lg font-bold text-[#1a2b4b]">{{ d()!.attendancePercentage }}%</p>
                </div>
                <div class="rounded-xl border border-slate-100 bg-white p-3">
                  <p class="text-[10px] font-bold uppercase text-slate-500">Recent assessment</p>
                  <p class="font-headline text-lg font-bold text-[#1a2b4b]">{{ d()!.recentAssessmentScore }}%</p>
                </div>
                <div class="rounded-xl border border-slate-100 bg-white p-3">
                  <p class="text-[10px] font-bold uppercase text-slate-500">Risk score</p>
                  <p class="font-headline text-lg font-bold text-rose-700">{{ d()!.riskScore }}</p>
                </div>
              </div>

              <div>
                <p class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Risk & module</p>
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 {{ riskChipClass(d()!.riskLevel) }}"
                    >{{ d()!.riskLevel }}</span
                  >
                  <span class="text-sm font-medium text-slate-800">{{ d()!.currentModule }}</span>
                </div>
                <p class="mt-2 text-sm text-slate-600">Trend: <span class="font-semibold">{{ d()!.performanceTrend }}</span></p>
              </div>

              <div>
                <p class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Weak topics</p>
                <div class="flex flex-wrap gap-2">
                  @for (w of d()!.weakTopics; track w.id) {
                    <span class="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                      {{ w.topicName }}
                      <span class="text-slate-500">({{ w.severity }})</span>
                    </span>
                  }
                </div>
              </div>

              <div class="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  class="rounded-lg bg-[#003f87] px-3 py-2 text-xs font-bold text-white shadow-sm"
                  (click)="requestAssign.emit()"
                >
                  Assign support
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                  (click)="requestNote.emit()"
                >
                  Add note
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                  (click)="requestMeeting.emit()"
                >
                  Schedule meeting
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800"
                  (click)="requestReferral.emit()"
                >
                  Refer counselor
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                  (click)="quickEscalate()"
                >
                  Escalate
                </button>
              </div>

              <div>
                <p class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Interventions</p>
                <ul class="space-y-3">
                  @for (i of d()!.interventions; track i.id) {
                    <li class="rounded-xl border border-slate-100 bg-white p-3 text-sm shadow-sm">
                      <p class="font-semibold text-slate-900">{{ i.interventionType }} · {{ i.priority }}</p>
                      <p class="text-slate-600">To: {{ i.assignedToName }} ({{ i.assignedToRole }})</p>
                      <p class="text-xs text-slate-500">Due {{ i.dueDate | slice: 0:10 }} · {{ i.status }}</p>
                      @if (i.status !== 'reviewed' && i.status !== 'completed') {
                        <div class="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            class="text-xs font-bold uppercase tracking-wide text-[#003f87] hover:underline"
                            (click)="markReviewed(i)"
                          >
                            Mark reviewed
                          </button>
                          <button
                            type="button"
                            class="text-xs font-bold uppercase tracking-wide text-slate-600 hover:underline"
                            (click)="setInterventionFollowUp(i)"
                          >
                            Set follow-up
                          </button>
                        </div>
                      }
                    </li>
                  } @empty {
                    <li class="text-sm text-slate-500">No interventions yet.</li>
                  }
                </ul>
              </div>

              <div>
                <p class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Notes</p>
                <ul class="space-y-2 text-sm">
                  @for (n of d()!.notes; track n.id) {
                    <li class="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
                      <span class="text-xs font-bold text-[#003f87]">{{ n.noteType }}</span>
                      <p class="text-slate-700">{{ n.noteText }}</p>
                      <p class="text-[10px] text-slate-500">{{ n.addedBy }} · {{ n.createdAt | slice: 0:16 }}</p>
                    </li>
                  } @empty {
                    <li class="text-slate-500">No notes yet.</li>
                  }
                </ul>
              </div>

              <div>
                <p class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Meetings</p>
                <ul class="space-y-2 text-sm">
                  @for (m of d()!.meetings; track m.id) {
                    <li class="flex flex-col gap-1 rounded-lg border border-slate-100 px-3 py-2">
                      <span class="font-medium text-slate-900">{{ m.title }}</span>
                      <span class="text-xs text-slate-500">{{ m.scheduledDate | slice: 0:16 }} · {{ m.status }}</span>
                      @if (m.status === 'scheduled') {
                        <button
                          type="button"
                          class="self-start text-xs font-bold uppercase text-emerald-700 hover:underline"
                          (click)="completeMeeting(m)"
                        >
                          Mark completed
                        </button>
                      }
                    </li>
                  } @empty {
                    <li class="text-slate-500">No meetings scheduled.</li>
                  }
                </ul>
              </div>

              <div>
                <p class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Referrals & escalations</p>
                <ul class="space-y-2 text-sm">
                  @for (r of d()!.referrals; track r.id) {
                    <li class="rounded-lg border border-slate-100 px-3 py-2">
                      <span class="font-medium text-slate-900">{{ r.referralType }} → {{ r.referredTo }}</span>
                      <p class="text-xs text-slate-600">{{ r.reason | slice: 0 : 120 }}{{ r.reason.length > 120 ? '…' : '' }}</p>
                      <p class="text-[10px] text-slate-500">{{ r.status }}</p>
                      @if (r.status === 'pending') {
                        <button
                          type="button"
                          class="mt-1 text-xs font-bold uppercase text-[#003f87] hover:underline"
                          (click)="ackReferral(r)"
                        >
                          Acknowledge
                        </button>
                      }
                    </li>
                  } @empty {
                    <li class="text-slate-500">No referrals.</li>
                  }
                </ul>
              </div>
            </div>
          }
        </div>
      </aside>
    }
  `,
  imports: [SlicePipe],
})
export class StudentMonitoringDrawerComponent {
  private readonly api = inject(StudentMonitoringService);
  private readonly toast = inject(ToastService);
  private readonly session = inject(SessionService);

  readonly open = input(false);
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly details = input<StudentMonitoringDetails | null>(null);

  readonly closed = output<void>();
  readonly dataChanged = output<void>();
  readonly requestAssign = output<void>();
  readonly requestNote = output<void>();
  readonly requestMeeting = output<void>();
  readonly requestReferral = output<void>();
  readonly requestFollowUpMeeting = output<void>();

  d = () => this.details();

  riskChipClass(level: string): string {
    const v = level?.toLowerCase() ?? '';
    if (v === 'critical') {
      return 'bg-rose-100 text-rose-800 ring-rose-200';
    }
    if (v === 'moderate') {
      return 'bg-sky-100 text-sky-900 ring-sky-200';
    }
    return 'bg-sky-50 text-sky-800 ring-sky-200';
  }

  onBackdrop(ev: MouseEvent): void {
    if (ev.target === ev.currentTarget) {
      this.closed.emit();
    }
  }

  markReviewed(i: InterventionAssignmentDto): void {
    const body = this.toInterventionUpdate(i, 'reviewed');
    this.api.updateIntervention(i.id, body).subscribe({
      next: () => {
        this.toast.show('Intervention marked as reviewed.', 'success');
        this.dataChanged.emit();
      },
      error: (e: Error) => this.toast.show(e.message, 'error'),
    });
  }

  setInterventionFollowUp(i: InterventionAssignmentDto): void {
    const body = this.toInterventionUpdate(i, i.status);
    const follow = new Date();
    follow.setDate(follow.getDate() + 7);
    body.followUpDate = follow.toISOString();
    this.api.updateIntervention(i.id, body).subscribe({
      next: () => {
        this.toast.show('Follow-up date updated.', 'success');
        this.dataChanged.emit();
      },
      error: (e: Error) => this.toast.show(e.message, 'error'),
    });
  }

  completeMeeting(m: MeetingDto): void {
    const body: UpdateMeetingPayload = {
      title: m.title,
      description: m.description,
      scheduledDate: m.scheduledDate,
      meetingType: m.meetingType,
      status: 'completed',
      isActive: m.isActive,
    };
    this.api.updateMeeting(m.id, body).subscribe({
      next: () => {
        this.toast.show('Meeting marked completed.', 'success');
        this.dataChanged.emit();
      },
      error: (e: Error) => this.toast.show(e.message, 'error'),
    });
  }

  ackReferral(r: ReferralDto): void {
    const body: UpdateReferralPayload = {
      referralType: r.referralType,
      referredTo: r.referredTo,
      reason: r.reason,
      status: 'acknowledged',
      isActive: r.isActive,
    };
    this.api.updateReferral(r.id, body).subscribe({
      next: () => {
        this.toast.show('Referral acknowledged.', 'success');
        this.dataChanged.emit();
      },
      error: (e: Error) => this.toast.show(e.message, 'error'),
    });
  }

  quickEscalate(): void {
    const id = this.details()?.id;
    if (!id) {
      return;
    }
    const user = this.session.getUser()?.name?.trim() || 'Lecturer';
    this.api
      .createReferral({
        studentProfileId: id,
        referralType: 'escalation',
        referredTo: 'Head of Department',
        reason: 'Escalated from high-risk monitoring for senior academic review.',
        status: 'pending',
        createdBy: user,
      })
      .subscribe({
        next: () => {
          this.toast.show('Escalation recorded.', 'success');
          this.dataChanged.emit();
        },
        error: (e: Error) => this.toast.show(e.message, 'error'),
      });
  }

  private toInterventionUpdate(i: InterventionAssignmentDto, status: string): UpdateInterventionAssignmentPayload {
    return {
      assignedToName: i.assignedToName,
      assignedToRole: i.assignedToRole,
      interventionType: i.interventionType,
      priority: i.priority,
      note: i.note,
      dueDate: i.dueDate,
      followUpDate: i.followUpDate,
      status,
      isActive: i.isActive,
    };
  }
}
