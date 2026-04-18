import { Component, input, output, signal, computed, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReadinessService } from '../../../services/readiness.service';
import { ToastService } from '../../../services/toast.service';
import { Question, QuestionFilter } from '../../../models/readiness/question.model';
import { Quiz, QuizStatus } from '../../../models/readiness/quiz.model';
import { PillBadgeComponent } from '../../ui/pill-badge/pill-badge.component';

// quiz form - multi-step wizard used in the quiz builder page
// step 1: quiz info (title, module, intake)
// step 2: select questions from the bank
// step 3: examination rules (time, attempts, pass threshold)
@Component({
  selector: 'app-quiz-form',
  standalone: true,
  imports: [FormsModule, PillBadgeComponent],
  templateUrl: './quiz-form.html',
})
export class QuizFormComponent implements OnInit {
  private readinessService = inject(ReadinessService);
  private toastService = inject(ToastService);

  // pass an existing quiz to edit, or null for new
  quiz = input<Quiz | null>(null);

  /** Disable Create Quiz while the parent API call runs */
  isSaving = input(false);

  // emitted when the quiz is submitted
  formSubmit = output<Partial<Quiz> & { moduleId?: string }>();

  // current step (1, 2, or 3)
  currentStep = signal(1);

  // step 1 fields
  title = signal('');
  module = signal('');
  moduleCode = signal('');
  moduleId = signal(''); // GUID - backend needs this
  intake = signal('');

  // step 2 - available questions and selected ones
  availableQuestions = signal<Question[]>([]);
  selectedQuestionIds = signal<Set<string>>(new Set());

  // step 3 - examination rules
  timeLimit = signal(60);
  totalAttempts = signal(1);
  passThreshold = signal(40);

  // real module list from API (with GUIDs) — signal + deferred updates avoid NG0100 after HTTP
  moduleList = signal<{ id: string; moduleCode: string; moduleName: string }[]>([]);

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
    if (!this.moduleId()) return 'Please select a module';
    return '';
  });

  isStep1Valid = computed(() => {
    return this.title().trim() !== '' && this.moduleId() !== '';
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
    // Defer signal updates to the next microtask so dev-mode CD verification does not see
    // module/options appear mid-check (NG0100 on <option [value]="mod.id">).
    this.readinessService.getModuleList().subscribe({
      next: (mods) => {
        queueMicrotask(() => this.moduleList.set(mods));
      },
      error: () => {
        console.error('Failed to load modules');
      },
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
      void this.loadQuestionsForModule();
    }
  }

  // when user selects a module from the dropdown
  onModuleSelect(id: string) {
    this.moduleId.set(id);
    const mod = this.moduleList().find((m) => m.id === id);
    if (mod) {
      this.module.set(mod.moduleName);
      this.moduleCode.set(mod.moduleCode);
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
      if (this.currentStep() === 1) {
        void this.loadQuestionsForModule();
      }
      this.stepSubmitted.set(false);
      this.currentStep.update((s) => s + 1);
    }
  }

  private loadQuestionsForModule(): void {
    const id = this.moduleId().trim();
    const code = this.moduleCode().trim();
    const filter: QuestionFilter = {
      status: 'Active',
    };
    if (id) {
      filter.moduleId = id;
    } else if (code) {
      filter.module = code;
    }
    this.readinessService.getQuestions(filter).subscribe({
      next: (questions) => {
        const active = questions.filter((q) => q.status === 'Active');
        queueMicrotask(() => {
          this.availableQuestions.set(active);
          const valid = new Set(active.map((q) => q.id));
          const nextSel = new Set([...this.selectedQuestionIds()].filter((x) => valid.has(x)));
          this.selectedQuestionIds.set(nextSel);
        });
      },
      error: () => {
        this.toastService.error('Could not load questions for this module. Check the API and try again.');
      },
    });
  }

  /** Save Draft: same payload as create, status Draft (only after all steps are valid) */
  saveDraft() {
    if (this.currentStep() < 3) {
      this.toastService.info('Use Next Step to add questions and rules. You can save a draft on step 3.');
      return;
    }
    this.emitQuizPayload('Draft');
  }

  // navigate to previous step
  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  // go to a specific step
  goToStep(step: number) {
    if (step === 2 && this.moduleId()) {
      this.loadQuestionsForModule();
    }
    this.currentStep.set(step);
  }

  // submit the quiz - validate step 3 first
  onSubmit() {
    this.emitQuizPayload('Published');
  }

  private emitQuizPayload(status: QuizStatus) {
    this.stepSubmitted.set(true);
    if (!this.isStep1Valid() || !this.isStep2Valid() || !this.isStep3Valid()) {
      if (status === 'Draft') {
        this.toastService.error('Fix the highlighted fields before saving a draft.');
      }
      return;
    }

    const questions = Array.from(this.selectedQuestionIds()).map((id, index) => {
      const q = this.availableQuestions().find((aq) => aq.id === id);
      const m = q?.marks ?? 5;
      return {
        questionId: id,
        order: index + 1,
        marks: Math.max(1, Math.min(100, m)),
      };
    });

    const data: Partial<Quiz> & { moduleId: string } = {
      title: this.title(),
      moduleId: this.moduleId(),
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
      shuffleQuestions: false,
      shuffleOptions: false,
      status,
    };

    this.formSubmit.emit(data);
  }
}
