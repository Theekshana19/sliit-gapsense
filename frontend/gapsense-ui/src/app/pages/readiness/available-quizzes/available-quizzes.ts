import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MemberShellComponent } from '../../../components/layout/member-shell/member-shell.component';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { ReadinessService } from '../../../services/readiness.service';
import { ToastService } from '../../../services/toast.service';
import { QuizSchedule } from '../../../models/readiness/quiz.model';

// Lists readiness quizzes that are scheduled in the current open window (API filters for students).
@Component({
  selector: 'app-available-quizzes',
  standalone: true,
  imports: [MemberShellComponent, LoadingSpinnerComponent, RouterLink],
  templateUrl: './available-quizzes.html',
})
export class AvailableQuizzesComponent implements OnInit {
  private readinessService = inject(ReadinessService);
  private toastService = inject(ToastService);

  isLoading = signal(true);
  schedules = signal<QuizSchedule[]>([]);

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading.set(true);
    this.readinessService.getSchedules().subscribe({
      next: (data) => {
        this.schedules.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Could not load scheduled quizzes.');
        this.isLoading.set(false);
      },
    });
  }
}
