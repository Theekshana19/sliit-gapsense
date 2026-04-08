import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MemberShellComponent } from '../../../components/layout/member-shell/member-shell.component';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { PillBadgeComponent } from '../../../components/ui/pill-badge/pill-badge.component';
import { ReadinessService } from '../../../services/readiness.service';
import { ToastService } from '../../../services/toast.service';
import { SubmissionDetail } from '../../../models/readiness/submission.model';

// submission detail page - shows full breakdown of one quiz attempt
// students can see what they got right/wrong and the correct answers
// lecturers can review any student's submission
// route: /readiness/submissions/:id
@Component({
  selector: 'app-submission-detail',
  standalone: true,
  imports: [MemberShellComponent, LoadingSpinnerComponent, PillBadgeComponent, DatePipe],
  templateUrl: './submission-detail.html',
})
export class SubmissionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readinessService = inject(ReadinessService);
  private toastService = inject(ToastService);

  isLoading = signal(true);
  submission = signal<SubmissionDetail | null>(null);

  // computed values for the summary card
  scoreText = computed(() => {
    const s = this.submission();
    if (!s) return '0 / 0';
    return `${s.score} / ${s.totalMarks}`;
  });

  resultBadge = computed(() => {
    const s = this.submission();
    if (!s) return { label: 'Pending', variant: 'neutral' as const };
    if (s.isPassed) return { label: 'Passed', variant: 'success' as const };
    return { label: 'Failed', variant: 'error' as const };
  });

  // count correct vs incorrect answers
  correctCount = computed(() => this.submission()?.answers.filter((a) => a.isCorrect).length ?? 0);
  incorrectCount = computed(() => this.submission()?.answers.filter((a) => !a.isCorrect).length ?? 0);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.toastService.error('No submission ID provided');
      this.router.navigate(['/readiness/attempt-history']);
      return;
    }

    this.loadSubmission(id);
  }

  loadSubmission(id: string) {
    this.isLoading.set(true);
    this.readinessService.getSubmissionDetail(id).subscribe({
      next: (data) => {
        if (!data) {
          this.toastService.error('Submission not found');
          this.router.navigate(['/readiness/attempt-history']);
          return;
        }
        this.submission.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Failed to load submission';
        this.toastService.error(msg);
        this.isLoading.set(false);
        this.router.navigate(['/readiness/attempt-history']);
      },
    });
  }

  // get badge variant for difficulty
  getDifficultyVariant(difficulty: string): 'primary' | 'error' | 'success' | 'neutral' {
    switch (difficulty) {
      case 'Easy': return 'success';
      case 'Medium': return 'primary';
      case 'Hard': return 'error';
      default: return 'neutral';
    }
  }

  goBack() {
    this.router.navigate(['/readiness/attempt-history']);
  }
}
