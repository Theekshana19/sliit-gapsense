import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MemberShellComponent } from '../../../components/layout/member-shell/member-shell.component';
import { PillBadgeComponent } from '../../../components/ui/pill-badge/pill-badge.component';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { AuthUiService } from '../../../services/auth-ui.service';
import { ReadinessService } from '../../../services/readiness.service';
import { ToastService } from '../../../services/toast.service';
import { AttemptSummary, AttemptStats } from '../../../models/readiness/submission.model';

// attempt history page - view all past quiz attempts with statistics
// shows overall stats, recent attempts, and performance trends
@Component({
  selector: 'app-attempt-history',
  standalone: true,
  imports: [MemberShellComponent, PillBadgeComponent, LoadingSpinnerComponent, DecimalPipe],
  templateUrl: './attempt-history.html',
})
export class AttemptHistoryComponent implements OnInit {
  private readinessService = inject(ReadinessService);
  private authUi = inject(AuthUiService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  isLoading = signal(true);
  attempts = signal<AttemptSummary[]>([]);
  stats = signal<AttemptStats>({ totalAttempts: 0, avgSuccessRate: 0, flaggedAttempts: 0, changePercentage: 0 });

  readonly pageSubtitle = computed(() =>
    this.authUi.currentUser()?.role === 'student'
      ? 'Your submitted readiness quiz attempts'
      : 'Overview of student progress'
  );

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    this.readinessService.getAttemptHistory().subscribe({
      next: (data) => {
        this.attempts.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load attempt history');
        this.isLoading.set(false);
      },
    });

    this.readinessService.getAttemptStats().subscribe({
      next: (s) => this.stats.set(s),
      error: () => this.toastService.error('Failed to load attempt stats'),
    });
  }

  // get status badge variant
  getStatusVariant(status: string): 'primary' | 'error' | 'neutral' {
    switch (status) {
      case 'Graded': return 'primary';
      case 'Pending Review': return 'error';
      default: return 'neutral';
    }
  }

  // get status icon
  getStatusIcon(status: string): string {
    switch (status) {
      case 'Graded': return 'check_circle';
      case 'Pending Review': return 'warning';
      case 'In Progress': return 'pause_circle';
      default: return 'info';
    }
  }

  // navigate to the submission detail page
  viewDetails(attemptId: string) {
    this.router.navigate(['/readiness/submissions', attemptId]);
  }
}
