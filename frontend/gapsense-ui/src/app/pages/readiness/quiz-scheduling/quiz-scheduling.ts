import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MemberShellComponent } from '../../../components/layout/member-shell/member-shell.component';
import { PillBadgeComponent } from '../../../components/ui/pill-badge/pill-badge.component';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { ConfirmPromptDialogComponent } from '../../../components/ui/confirm-dialog/confirm-prompt-dialog';
import { ReadinessService } from '../../../services/readiness.service';
import { ToastService } from '../../../services/toast.service';
import { Quiz, QuizSchedule, ResultVisibility } from '../../../models/readiness/quiz.model';

// quiz scheduling page - manage when quizzes are available to students
// lecturers can set start/end dates, attempt limits, and result visibility
// supports create + edit + delete actions on existing schedules
@Component({
  selector: 'app-quiz-scheduling',
  standalone: true,
  imports: [MemberShellComponent, PillBadgeComponent, LoadingSpinnerComponent, ConfirmPromptDialogComponent, FormsModule],
  templateUrl: './quiz-scheduling.html',
})
export class QuizSchedulingComponent implements OnInit {
  private readinessService = inject(ReadinessService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoading = signal(true);
  schedules = signal<QuizSchedule[]>([]);
  quizzes = signal<Quiz[]>([]); // available quizzes for the dropdown

  // quick scheduler form fields
  selectedQuizId = signal('');
  startDate = signal('');
  endDate = signal('');
  attemptLimit = signal(1);
  resultVisibility = signal<ResultVisibility>('Immediate');

  // edit mode state - tracks which schedule we're editing (empty = create mode)
  editingScheduleId = signal('');
  isEditMode = signal(false);

  // delete confirm dialog state
  showDeleteDialog = signal(false);
  scheduleToDelete = signal<QuizSchedule | null>(null);

  // stats - calculated from real data
  get totalAssessments() { return this.schedules().length; }
  get publishedCount() { return this.schedules().filter(s => s.status === 'Published').length; }
  get scheduledCount() { return this.schedules().filter(s => s.status === 'Scheduled').length; }
  get draftCount() { return this.schedules().filter(s => s.status === 'Draft').length; }

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const id = params.get('quizId');
      if (id) this.selectedQuizId.set(id);
    });

    this.loadSchedules();
    this.readinessService.getQuizzes().subscribe({
      next: (data) => this.quizzes.set(data),
      error: () => {
        this.toastService.error('Failed to load quizzes');
      },
    });
  }

  loadSchedules() {
    this.isLoading.set(true);
    this.readinessService.getSchedules().subscribe({
      next: (data) => {
        this.schedules.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load schedules');
        this.isLoading.set(false);
      },
    });
  }

  // get status badge variant
  getStatusVariant(status: string): 'primary' | 'error' | 'neutral' | 'success' {
    switch (status) {
      case 'Published': return 'primary';
      case 'Scheduled': return 'success';
      default: return 'neutral';
    }
  }

  // load an existing schedule into the form for editing
  // user clicks the edit pencil icon on the table row
  onEdit(schedule: QuizSchedule) {
    this.isEditMode.set(true);
    this.editingScheduleId.set(schedule.id);
    this.selectedQuizId.set(schedule.quizId);
    // dates from API come as ISO strings - convert to YYYY-MM-DD for the date input
    this.startDate.set(this.formatDateForInput(schedule.startDate));
    this.endDate.set(this.formatDateForInput(schedule.endDate));
    this.attemptLimit.set(schedule.maxAttempts);
    this.resultVisibility.set(schedule.resultVisibility);
    this.toastService.info('Editing schedule — make your changes and click Save');

    // scroll to the form for better UX
    setTimeout(() => {
      const form = document.querySelector('.quick-scheduler-form');
      if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  // helper to format ISO date string for HTML date input (needs YYYY-MM-DD)
  private formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';
    // handle both ISO strings and date-only strings
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }

  // save (create or update based on edit mode)
  onPublish() {
    if (!this.selectedQuizId()) {
      this.toastService.error('Please select a quiz first');
      return;
    }
    if (!this.startDate() || !this.endDate()) {
      this.toastService.error('Please set start and end dates');
      return;
    }

    const payload = {
      quizId: this.selectedQuizId(),
      startDate: this.startDate(),
      endDate: this.endDate(),
      maxAttempts: this.attemptLimit(),
      resultVisibility: this.resultVisibility(),
      status: 'Published' as const,
    };

    if (this.isEditMode()) {
      // update existing schedule
      this.readinessService.updateSchedule(this.editingScheduleId(), payload as any).subscribe({
        next: () => {
          this.toastService.success('Schedule updated successfully!');
          this.onDiscard();
          this.loadSchedules();
        },
        error: (err: any) => {
          const msg = err?.error?.message || 'Failed to update schedule';
          this.toastService.error(msg);
        },
      });
    } else {
      // create new schedule
      this.readinessService.createSchedule(payload).subscribe({
        next: () => {
          this.toastService.success('Quiz scheduled and published!');
          this.onDiscard();
          this.loadSchedules();
        },
        error: (err: any) => {
          const msg = err?.error?.message || 'Failed to publish schedule';
          this.toastService.error(msg);
        },
      });
    }
  }

  // ask for confirmation before deleting
  confirmDelete(schedule: QuizSchedule) {
    this.scheduleToDelete.set(schedule);
    this.showDeleteDialog.set(true);
  }

  // delete after user confirms
  onDeleteConfirmed() {
    const schedule = this.scheduleToDelete();
    if (!schedule) return;

    this.readinessService.deleteSchedule(schedule.id).subscribe({
      next: () => {
        this.toastService.success('Schedule deleted successfully');
        this.showDeleteDialog.set(false);
        this.scheduleToDelete.set(null);
        this.loadSchedules();
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Failed to delete schedule';
        this.toastService.error(msg);
        this.showDeleteDialog.set(false);
      },
    });
  }

  onDeleteCancelled() {
    this.showDeleteDialog.set(false);
    this.scheduleToDelete.set(null);
  }

  // discard form changes - resets back to create mode
  onDiscard() {
    this.isEditMode.set(false);
    this.editingScheduleId.set('');
    this.selectedQuizId.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.attemptLimit.set(1);
    this.resultVisibility.set('Immediate');
  }
}
