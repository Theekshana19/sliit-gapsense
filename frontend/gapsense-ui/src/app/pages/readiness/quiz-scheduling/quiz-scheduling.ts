import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '../../../components/layout/main-layout/main-layout';
import { StatusBadgeComponent } from '../../../components/ui/status-badge/status-badge';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { ReadinessService } from '../../../services/readiness.service';
import { ToastService } from '../../../services/toast.service';
import { QuizSchedule, ResultVisibility } from '../../../models/readiness/quiz.model';

// quiz scheduling page - manage when quizzes are available to students
// lecturers can set start/end dates, attempt limits, and result visibility
@Component({
  selector: 'app-quiz-scheduling',
  standalone: true,
  imports: [MainLayoutComponent, StatusBadgeComponent, LoadingSpinnerComponent, FormsModule],
  templateUrl: './quiz-scheduling.html',
})
export class QuizSchedulingComponent implements OnInit {
  private readinessService = inject(ReadinessService);
  private toastService = inject(ToastService);

  isLoading = signal(true);
  schedules = signal<QuizSchedule[]>([]);

  // quick scheduler form fields
  selectedScheduleId = signal('');
  startDate = signal('');
  endDate = signal('');
  attemptLimit = signal(1);
  resultVisibility = signal<ResultVisibility>('Immediate');

  // stats
  totalAssessments = 24;
  publishedCount = 12;
  scheduledCount = 8;
  draftCount = 4;

  ngOnInit() {
    this.loadSchedules();
  }

  loadSchedules() {
    this.isLoading.set(true);
    this.readinessService.getSchedules().subscribe((data) => {
      this.schedules.set(data);
      this.isLoading.set(false);
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
    if (!this.selectedScheduleId()) {
      this.toastService.error('Please select a quiz first');
      return;
    }

    this.readinessService.updateSchedule(this.selectedScheduleId(), {
      startDate: this.startDate(),
      endDate: this.endDate(),
      maxAttempts: this.attemptLimit(),
      resultVisibility: this.resultVisibility(),
      status: 'Published',
    }).subscribe(() => {
      this.toastService.success('Quiz published successfully!');
      this.loadSchedules();
    });
  }

  // discard form changes
  onDiscard() {
    this.selectedScheduleId.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.attemptLimit.set(1);
    this.resultVisibility.set('Immediate');
  }
}
