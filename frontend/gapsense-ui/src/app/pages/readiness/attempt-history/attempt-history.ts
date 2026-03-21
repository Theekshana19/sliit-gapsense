import { Component, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MainLayoutComponent } from '../../../components/layout/main-layout/main-layout';
import { StatusBadgeComponent } from '../../../components/ui/status-badge/status-badge';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { ReadinessService } from '../../../services/readiness.service';
import { AttemptSummary, AttemptStats } from '../../../models/readiness/submission.model';

// attempt history page - view all past quiz attempts with statistics
// shows overall stats, recent attempts, and performance trends
@Component({
  selector: 'app-attempt-history',
  standalone: true,
  imports: [MainLayoutComponent, StatusBadgeComponent, LoadingSpinnerComponent, DecimalPipe],
  templateUrl: './attempt-history.html',
})
export class AttemptHistoryComponent implements OnInit {
  private readinessService = inject(ReadinessService);

  isLoading = signal(true);
  attempts = signal<AttemptSummary[]>([]);
  stats = signal<AttemptStats>({ totalAttempts: 0, avgSuccessRate: 0, flaggedAttempts: 0, changePercentage: 0 });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    this.readinessService.getAttemptHistory().subscribe((data) => {
      this.attempts.set(data);
      this.isLoading.set(false);
    });

    this.readinessService.getAttemptStats().subscribe((s) => {
      this.stats.set(s);
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
}
