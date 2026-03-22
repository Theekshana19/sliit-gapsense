import { Component, input, output, signal, computed, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReadinessService } from '../../../services/readiness.service';
import { Question } from '../../../models/readiness/question.model';
import { Quiz } from '../../../models/readiness/quiz.model';
import { StatusBadgeComponent } from '../../ui/status-badge/status-badge';

// quiz form - multi-step wizard used in the quiz builder page
// step 1: quiz info (title, module, intake)
// step 2: select questions from the bank
// step 3: examination rules (time, attempts, pass threshold)
@Component({
  selector: 'app-quiz-form',
  standalone: true,
  imports: [FormsModule, StatusBadgeComponent],
  templateUrl: './quiz-form.html',
})
export class QuizFormComponent implements OnInit {
  private readinessService = inject(ReadinessService);

  // pass an existing quiz to edit, or null for new
  quiz = input<Quiz | null>(null);

  // emitted when the quiz is submitted
  formSubmit = output<Partial<Quiz>>();

  // current step (1, 2, or 3)
  currentStep = signal(1);

  // step 1 fields
  title = signal('');
  module = signal('');
  moduleCode = signal('');
  intake = signal('');

  // step 2 - available questions and selected ones
  availableQuestions = signal<Question[]>([]);
  selectedQuestionIds = signal<Set<string>>(new Set());

  // step 3 - examination rules
  timeLimit = signal(60);
  totalAttempts = signal(1);
  passThreshold = signal(40);

  // dropdown options
  modules: string[] = [];

  // track if user tried to go next or submit (shows errors)
  stepSubmitted = signal(false);

  // --- step 1 validations ---
  titleError = computed(() => {
    if (!this.stepSubmitted()) return '';
    if (!this.title().trim()) return 'Quiz title is required';
    return '';
  });

  moduleError = computed(() => {
    if (!this.stepSubmitted()) return '';
    if (!this.module()) return 'Please select a module';
    return '';
  });

  isStep1Valid = computed(() => {
    return this.title().trim() !== '' && this.module() !== '';
  });

  // --- step 2 validations ---
  questionsError = computed(() => {
    if (!this.stepSubmitted()) return '';
    if (this.selectedQuestionIds().size === 0) return 'Please select at least 1 question';
    return '';
  });

  isStep2Valid = computed(() => {
    return this.selectedQuestionIds().size > 0;
  });

  // --- step 3 validations ---
  timeLimitError = computed(() => {
    if (!this.stepSubmitted()) return '';
    if (this.timeLimit() < 5) return 'Time limit must be at least 5 minutes';
    return '';
  });

  passThresholdError = computed(() => {
    if (!this.stepSubmitted()) return '';
    if (this.passThreshold() < 0 || this.passThreshold() > 100) return 'Pass threshold must be between 0-100%';
    return '';
  });

  isStep3Valid = computed(() => {
    return this.timeLimit() >= 5 && this.passThreshold() >= 0 && this.passThreshold() <= 100;
  });

  ngOnInit() {
    this.modules = this.readinessService.getModules();

    // load available questions
    this.readinessService.getQuestions().subscribe((questions) => {
      this.availableQuestions.set(questions.filter((q) => q.status === 'Active'));
    });

    // if editing, fill the form
    const q = this.quiz();
    if (q) {
      this.title.set(q.title);
      this.module.set(q.module);
      this.moduleCode.set(q.moduleCode);
      this.intake.set(q.intake);
      this.timeLimit.set(q.timeLimitMinutes);
      this.totalAttempts.set(q.maxAttempts);
      this.passThreshold.set(q.passingPercentage);

      // mark existing questions as selected
      const ids = new Set(q.questions.map((qq) => qq.questionId));
      this.selectedQuestionIds.set(ids);
    }
  }

  // check if a question is selected
  isSelected(questionId: string): boolean {
    return this.selectedQuestionIds().has(questionId);
  }

  // toggle question selection
  toggleQuestion(questionId: string) {
    const current = new Set(this.selectedQuestionIds());
    if (current.has(questionId)) {
      current.delete(questionId);
    } else {
      current.add(questionId);
    }
    this.selectedQuestionIds.set(current);
  }

  // get the count of selected questions
  get selectedCount(): number {
    return this.selectedQuestionIds().size;
  }

  // get total marks of selected questions
  get totalMarks(): number {
    let total = 0;
    for (const q of this.availableQuestions()) {
      if (this.selectedQuestionIds().has(q.id)) {
        total += q.marks;
      }
    }
    return total;
  }

  // get difficulty badge variant
  getDifficultyVariant(difficulty: string): 'primary' | 'error' | 'neutral' {
    switch (difficulty) {
      case 'Hard': return 'error';
      case 'Medium': return 'primary';
      default: return 'neutral';
    }
  }

  // navigate to next step - validate current step first
  nextStep() {
    this.stepSubmitted.set(true);

    // check if current step is valid before moving
    if (this.currentStep() === 1 && !this.isStep1Valid()) return;
    if (this.currentStep() === 2 && !this.isStep2Valid()) return;

    // valid — move to next step and reset submitted flag
    if (this.currentStep() < 3) {
      this.stepSubmitted.set(false);
      this.currentStep.update((s) => s + 1);
    }
  }

  // navigate to previous step
  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  // go to a specific step
  goToStep(step: number) {
    this.currentStep.set(step);
  }

  // submit the quiz - validate step 3 first
  onSubmit() {
    this.stepSubmitted.set(true);
    if (!this.isStep3Valid()) return;
    // build the questions array with order and marks
    const questions = Array.from(this.selectedQuestionIds()).map((id, index) => {
      const q = this.availableQuestions().find((aq) => aq.id === id);
      return {
        questionId: id,
        order: index + 1,
        marks: q?.marks || 0,
      };
    });

    const data: Partial<Quiz> = {
      title: this.title(),
      module: this.module(),
      moduleCode: this.moduleCode(),
      intake: this.intake(),
      questions,
      totalQuestions: questions.length,
      totalMarks: this.totalMarks,
      passingPercentage: this.passThreshold(),
      passingMarks: Math.round((this.passThreshold() / 100) * this.totalMarks),
      timeLimitMinutes: this.timeLimit(),
      maxAttempts: this.totalAttempts(),
    };

    this.formSubmit.emit(data);
  }
}
