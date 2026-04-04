import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MainLayoutComponent } from '../../../components/layout/main-layout/main-layout';
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
  imports: [MainLayoutComponent, QuizFormComponent],
  templateUrl: './quiz-builder.html',
})
export class QuizBuilderComponent {
  private readinessService = inject(ReadinessService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // handle quiz form submission
  onQuizSubmit(data: Partial<Quiz>) {
    this.readinessService.createQuiz(data).subscribe((quiz) => {
      this.toastService.success('Quiz created successfully!');
      this.router.navigate(['/readiness/quiz-scheduling']);
    });
  }
}
