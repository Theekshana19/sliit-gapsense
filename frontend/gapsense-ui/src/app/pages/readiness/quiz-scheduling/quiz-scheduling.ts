import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MemberShellComponent } from '../../../components/layout/member-shell/member-shell.component';
import { PillBadgeComponent } from '../../../components/ui/pill-badge/pill-badge.component';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { ReadinessService } from '../../../services/readiness.service';
import { ToastService } from '../../../services/toast.service';
import { Quiz, QuizSchedule, ResultVisibility } from '../../../models/readiness/quiz.model';

// quiz scheduling page - manage when quizzes are available to students
// lecturers can set start/end dates, attempt limits, and result visibility
@Component({
  selector: 'app-quiz-scheduling',
  standalone: true,
  imports: [MemberShellComponent, PillBadgeComponent, LoadingSpinnerComponent, FormsModule],
  templateUrl: './quiz-scheduling.html',
})
export class QuizSchedulingComponent implements OnInit {
  private readinessService = inject(ReadinessService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  isLoading = signal(true);
  schedules = signal<QuizSchedule[]>([]);
  quizzes = signal<Quiz[]>([]); // available quizzes for the dropdown

  // quick scheduler form fields
  selectedQuizId = signal('');
  startDate = signal('');
  endDate = signal('');
  attemptLimit = signal(1);
  resultVisibility = signal<ResultVisibility>('Immediate');

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

  // publish a schedule with the quick scheduler form
  onPublish() {
    if (!this.selectedQuizId()) {
      this.toastService.error('Please select a quiz first');
      return;
    }
    if (!this.startDate() || !this.endDate()) {
      this.toastService.error('Please set start and end dates');
      return;
    }

    // create a new schedule for the selected quiz
    this.readinessService
      .createSchedule({
        quizId: this.selectedQuizId(),
        startDate: this.startDate(),
        endDate: this.endDate(),
        maxAttempts: this.attemptLimit(),
        resultVisibility: this.resultVisibility(),
        status: 'Published',
      })
      .subscribe({
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

  // discard form changes
  onDiscard() {
    this.selectedQuizId.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.attemptLimit.set(1);
    this.resultVisibility.set('Immediate');
  }
}
