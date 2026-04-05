import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MemberShellComponent } from '../../../components/layout/member-shell/member-shell.component';
import { QuizFormComponent } from '../../../components/readiness/quiz-form/quiz-form';
import { ReadinessService } from '../../../services/readiness.service';
import { ToastService } from '../../../services/toast.service';
import { Quiz } from '../../../models/readiness/quiz.model';

// quiz builder page - create a new quiz using the 3-step wizard
// step 1: set quiz info (title, module, intake)
// step 2: select questions from the bank
// step 3: configure examination rules
@Component({
  selector: 'app-quiz-builder',
  standalone: true,
  imports: [MemberShellComponent, QuizFormComponent],
  templateUrl: './quiz-builder.html',
})
export class QuizBuilderComponent {
  private readinessService = inject(ReadinessService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  isSaving = signal(false);

  // handle quiz form submission (Create Quiz or Save Draft — both POST /api/quizzes)
  onQuizSubmit(data: Partial<Quiz> & { moduleId?: string }) {
    this.isSaving.set(true);
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

  private apiErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (body && typeof body === 'object') {
        const msg = (body as { message?: string }).message;
        if (msg) return msg;
        const errors = (body as { errors?: Record<string, string[]> }).errors;
        if (errors) {
          const first = Object.values(errors).flat()[0];
          if (first) return first;
        }
      }
      if (err.status === 0) return 'Network error — is the API running?';
      if (err.status === 401) return 'Please sign in again.';
      if (err.status === 403) return 'You are not allowed to create quizzes.';
    }
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  }
}
