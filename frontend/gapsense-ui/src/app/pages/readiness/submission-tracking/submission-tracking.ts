import { Component, inject, signal, OnInit } from '@angular/core';
import { MemberShellComponent } from '../../../components/layout/member-shell/member-shell.component';
import { PillBadgeComponent } from '../../../components/ui/pill-badge/pill-badge.component';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { ReadinessService } from '../../../services/readiness.service';
import { Submission, SubmissionStats } from '../../../models/readiness/submission.model';

// submission tracking page - monitor who submitted, who's in progress, who hasn't attempted
// lecturers use this to see how students are doing with their quizzes
@Component({
  selector: 'app-submission-tracking',
  standalone: true,
  imports: [MemberShellComponent, PillBadgeComponent, LoadingSpinnerComponent],
  templateUrl: './submission-tracking.html',
})
export class SubmissionTrackingComponent implements OnInit {
  private readinessService = inject(ReadinessService);

  isLoading = signal(true);
  submissions = signal<Submission[]>([]);
  stats = signal<SubmissionStats>({ totalCompletionRate: 0, inProgressCount: 0, pendingReminders: 0, totalEnrollments: 0 });

  // filter values
  filterModule = signal('');
  filterQuiz = signal('');
  filterStatus = signal('');

  // pagination
  currentPage = signal(1);
  pageSize = 5;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    this.readinessService.getSubmissions().subscribe((data) => {
      this.submissions.set(data);
      this.isLoading.set(false);
    });

    this.readinessService.getSubmissionStats().subscribe((s) => {
      this.stats.set(s);
    });
  }

  // get filtered submissions
  get filteredSubmissions(): Submission[] {
    let result = this.submissions();

    if (this.filterStatus()) {
      result = result.filter((s) => s.status === this.filterStatus());
    }
    if (this.filterModule()) {
      result = result.filter((s) => s.moduleCode === this.filterModule());
    }

    return result;
  }

  // get paginated submissions
  get paginatedSubmissions(): Submission[] {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredSubmissions.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredSubmissions.length / this.pageSize);
  }

  // get status badge variant
  getStatusVariant(status: string): 'primary' | 'error' | 'neutral' {
    switch (status) {
      case 'Submitted': return 'primary';
      case 'Not Attempted': return 'error';
      default: return 'neutral';
    }
  }

  // get action icon based on status
  getActionIcon(status: string): string {
    switch (status) {
      case 'Submitted': return 'visibility';
      case 'In Progress': return 'analytics';
      case 'Not Attempted': return 'mail';
      default: return 'more_vert';
    }
  }

  onFilterStatus(value: string) {
    this.filterStatus.set(value);
    this.currentPage.set(1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage.set(page);
    }
  }
}
