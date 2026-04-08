import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MemberShellComponent } from '../../../../components/layout/member-shell/member-shell.component';
import { QuestionFormComponent } from '../../../../components/readiness/question-form/question-form';
import { LoadingSpinnerComponent } from '../../../../components/ui/loading-spinner/loading-spinner';
import { ReadinessService } from '../../../../services/readiness.service';
import { ToastService } from '../../../../services/toast.service';
import { Question } from '../../../../models/readiness/question.model';

// add/edit question page - creates a new question or edits an existing one
// route: /readiness/questions/new (create mode)
// route: /readiness/questions/:id/edit (edit mode)
@Component({
  selector: 'app-add-edit-question',
  standalone: true,
  imports: [MemberShellComponent, QuestionFormComponent, LoadingSpinnerComponent],
  templateUrl: './add-edit-question.html',
})
export class AddEditQuestionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readinessService = inject(ReadinessService);
  private toastService = inject(ToastService);

  // whether we're editing an existing question or creating a new one
  isEditMode = signal(false);

  // the question being edited (null if creating new)
  question = signal<Question | null>(null);

  // page title changes based on mode
  pageTitle = signal('Add Question');

  // loading state - don't show form until data is ready
  isLoading = signal(false);

  /** True while create/update request is running */
  isSaving = signal(false);

  ngOnInit() {
    // check if there's an id in the route - means we're editing
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.pageTitle.set('Edit Question');
      this.isLoading.set(true);

      // load the question data first, then show the form
      this.readinessService.getQuestionById(id).subscribe({
        next: (q) => {
          if (q) {
            this.question.set(q);
          } else {
            this.toastService.error('Question not found');
            this.router.navigate(['/readiness/question-bank']);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.toastService.error('Failed to load question');
          this.isLoading.set(false);
          this.router.navigate(['/readiness/question-bank']);
        },
      });
    }
  }

  // handle form submission
  onFormSubmit(data: Partial<Question>) {
    if (this.isEditMode()) {
      const id = this.route.snapshot.paramMap.get('id')!;
      this.isSaving.set(true);
      this.readinessService
        .updateQuestion(id, data)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => {
            this.toastService.success('Question updated. Returning to the list.');
            this.router.navigate(['/readiness/question-bank']);
          },
          error: (err: unknown) => {
            this.toastService.error(this.apiErrorMessage(err, 'Failed to update question'));
          },
        });
    } else {
      this.isSaving.set(true);
      this.readinessService
        .createQuestion(data)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: (created) => {
            const label = created?.questionId || created?.title || 'Question';
            this.toastService.success(`Saved: ${label}. Opening question list…`);
            this.router.navigate(['/readiness/question-bank']);
          },
          error: (err: unknown) => {
            this.toastService.error(this.apiErrorMessage(err, 'Could not save question'));
          },
        });
    }
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
      if (err.status === 403) return 'You are not allowed to create questions.';
    }
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  }

  // handle cancel - go back to question bank
  onFormCancel() {
    this.router.navigate(['/readiness/question-bank']);
  }
}
