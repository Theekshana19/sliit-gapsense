import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MemberShellComponent } from '../../../components/layout/member-shell/member-shell.component';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { QuizFormComponent } from '../../../components/readiness/quiz-form/quiz-form';
import { ReadinessService } from '../../../services/readiness.service';
import { ToastService } from '../../../services/toast.service';
import { Quiz } from '../../../models/readiness/quiz.model';

// quiz builder page - create or edit a quiz using the 3-step wizard
// step 1: set quiz info (title, module, intake)
// step 2: select questions from the bank
// step 3: configure examination rules
// edit mode triggers when route has :id param (loads existing quiz first)
@Component({
  selector: 'app-quiz-builder',
  standalone: true,
  imports: [MemberShellComponent, QuizFormComponent, LoadingSpinnerComponent],
  templateUrl: './quiz-builder.html',
})
export class QuizBuilderComponent implements OnInit {
  private readinessService = inject(ReadinessService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isSaving = signal(false);
  isLoading = signal(false);
  isEditMode = signal(false);
  quiz = signal<Quiz | null>(null);

  ngOnInit() {
    // check if we have a quiz id in the route - means edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.isLoading.set(true);

      // load the quiz first, then show the form
      this.readinessService.getQuizById(id).subscribe({
        next: (quiz) => {
          if (quiz) {
            this.quiz.set(quiz);
          } else {
            this.toastService.error('Quiz not found');
            this.router.navigate(['/readiness/quiz-scheduling']);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.toastService.error('Failed to load quiz');
          this.isLoading.set(false);
          this.router.navigate(['/readiness/quiz-scheduling']);
        },
      });
    }
  }

  // handle quiz form submission (create new or update existing)
  onQuizSubmit(data: Partial<Quiz> & { moduleId?: string }) {
    this.isSaving.set(true);

    if (this.isEditMode()) {
      // update existing quiz
      const id = this.route.snapshot.paramMap.get('id')!;
      this.readinessService
        .updateQuiz(id, data)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: (quiz) => {
            this.toastService.success(`Quiz updated: ${quiz.title}`);
            this.router.navigate(['/readiness/quiz-scheduling'], {
              queryParams: { quizId: quiz.id },
            });
          },
          error: (err: unknown) => {
            this.toastService.error(this.apiErrorMessage(err, 'Could not update quiz'));
          },
        });
    } else {
      // create new quiz
      this.readinessService
        .createQuiz(data)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: (quiz) => {
            const label = data.status === 'Draft' ? 'Draft saved' : 'Quiz created';
            this.toastService.success(`${label}: ${quiz.title}`);
            this.router.navigate(['/readiness/quiz-scheduling'], {
              queryParams: { quizId: quiz.id },
            });
          },
          error: (err: unknown) => {
            this.toastService.error(this.apiErrorMessage(err, 'Could not save quiz'));
          },
        });
    }
  }

  private apiErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (body && typeof body === 'object') {
        const msg = (body as { message?: string }).message;
        const apiErrors = (body as { errors?: string[] }).errors;
        if (msg && apiErrors?.[0]) return `${msg} ${apiErrors[0]}`;
        if (msg) return msg;
        if (apiErrors?.[0]) return apiErrors[0];
        const errors = (body as { errors?: Record<string, string[]> }).errors;
        if (errors) {
          const first = Object.values(errors).flat()[0];
          if (first) return first;
        }
      }
      if (err.status === 0) return 'Network error — is the API running?';
      if (err.status === 401) return 'Please sign in again.';
      if (err.status === 403) return 'You are not allowed to save this quiz.';
    }
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  }
}
