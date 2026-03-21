import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '../../../../components/layout/main-layout/main-layout';
import { QuestionFormComponent } from '../../../../components/readiness/question-form/question-form';
import { ReadinessService } from '../../../../services/readiness.service';
import { ToastService } from '../../../../services/toast.service';
import { Question } from '../../../../models/readiness/question.model';

// add/edit question page - creates a new question or edits an existing one
// route: /readiness/questions/new (create mode)
// route: /readiness/questions/:id/edit (edit mode)
@Component({
  selector: 'app-add-edit-question',
  standalone: true,
  imports: [MainLayoutComponent, QuestionFormComponent],
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

  ngOnInit() {
    // check if there's an id in the route - means we're editing
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.pageTitle.set('Edit Question');

      // load the question data
      this.readinessService.getQuestionById(id).subscribe((q) => {
        if (q) {
          this.question.set(q);
        } else {
          // question not found, go back
          this.toastService.error('Question not found');
          this.router.navigate(['/readiness/question-bank']);
        }
      });
    }
  }

  // handle form submission
  onFormSubmit(data: Partial<Question>) {
    if (this.isEditMode()) {
      // update existing question
      const id = this.route.snapshot.paramMap.get('id')!;
      this.readinessService.updateQuestion(id, data).subscribe(() => {
        this.toastService.success('Question updated successfully');
        this.router.navigate(['/readiness/question-bank']);
      });
    } else {
      // create new question
      this.readinessService.createQuestion(data).subscribe(() => {
        this.toastService.success('Question created successfully');
        this.router.navigate(['/readiness/question-bank']);
      });
    }
  }

  // handle cancel - go back to question bank
  onFormCancel() {
    this.router.navigate(['/readiness/question-bank']);
  }
}
