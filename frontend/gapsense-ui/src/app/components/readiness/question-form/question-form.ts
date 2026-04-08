import { Component, input, output, signal, computed, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Question, QuestionOption, QuestionType, DifficultyLevel, QuestionStatus } from '../../../models/readiness/question.model';
import { ReadinessService } from '../../../services/readiness.service';

// question form - used in the add/edit question page
// handles creating new questions and editing existing ones
// supports MCQ options with correct answer selection
@Component({
  selector: 'app-question-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './question-form.html',
})
export class QuestionFormComponent implements OnInit {
  private readinessService = inject(ReadinessService);

  // pass a question to edit, or null for creating a new one
  question = input<Question | null>(null);

  /** Parent sets true while POST/PUT is in flight to prevent double submit */
  isSubmitting = input(false);

  // emitted when the form is submitted with the data
  formSubmit = output<Partial<Question>>();

  // emitted when user clicks cancel
  formCancel = output<void>();

  // form fields
  title = signal('');
  questionText = signal('');
  questionType = signal<QuestionType>('MCQ');
  difficulty = signal<DifficultyLevel>('Easy');
  topic = signal('');
  module = signal('');
  moduleCode = signal('');
  moduleId = signal(''); // GUID - this is what the backend needs
  marks = signal(5);
  status = signal<QuestionStatus>('Draft');
  explanation = signal('');

  // MCQ options - start with 4 empty options
  options = signal<QuestionOption[]>([
    { id: 'a', optionText: '', isCorrect: false },
    { id: 'b', optionText: '', isCorrect: false },
    { id: 'c', optionText: '', isCorrect: false },
    { id: 'd', optionText: '', isCorrect: false },
  ]);

  // which option is the correct answer
  correctOptionId = signal('');

  // available modules and topics for dropdowns (real data from API)
  moduleList = signal<{ id: string; moduleCode: string; moduleName: string }[]>([]);
  topics: string[] = [];

  // status toggle - true means Active, false means Draft
  isActive = signal(false);

  // track if user tried to submit (errors show only after first attempt)
  submitted = signal(false);

  // --- validation rules ---

  // title is required
  titleError = computed(() => {
    if (!this.submitted()) return '';
    if (!this.title().trim()) return 'Question title is required';
    if (this.title().trim().length < 5) return 'Title must be at least 5 characters';
    return '';
  });

  // question text is required
  questionTextError = computed(() => {
    if (!this.submitted()) return '';
    if (!this.questionText().trim()) return 'Question text is required';
    return '';
  });

  // at least 2 options must have text
  optionsError = computed(() => {
    if (!this.submitted()) return '';
    const filled = this.options().filter((o) => o.optionText.trim() !== '');
    if (filled.length < 2) return 'At least 2 options must be filled in';
    return '';
  });

  // correct answer must be selected
  correctAnswerError = computed(() => {
    if (!this.submitted()) return '';
    if (!this.correctOptionId()) return 'Please select the correct answer';
    // also check that the selected option actually has text
    const selected = this.options().find((o) => o.id === this.correctOptionId());
    if (selected && !selected.optionText.trim()) return 'The correct answer option cannot be empty';
    return '';
  });

  // marks must be greater than 0
  marksError = computed(() => {
    if (!this.submitted()) return '';
    if (this.marks() <= 0) return 'Marks must be greater than 0';
    if (this.marks() > 100) return 'Marks cannot exceed 100';
    return '';
  });

  // curriculum module GUID required for API
  moduleError = computed(() => {
    if (!this.submitted()) return '';
    if (!this.moduleId().trim()) return 'Select a module — required to save';
    return '';
  });

  // check if the whole form is valid
  isFormValid = computed(() => {
    const filledOptions = this.options().filter((o) => o.optionText.trim() !== '');
    return (
      this.moduleId().trim() !== '' &&
      this.title().trim().length >= 5 &&
      this.questionText().trim() !== '' &&
      filledOptions.length >= 2 &&
      this.correctOptionId() !== '' &&
      this.marks() > 0 &&
      this.marks() <= 100
    );
  });

  ngOnInit() {
    const q = this.question();

    // if editing, set the module id immediately from the question itself
    // backend now returns moduleId directly so we don't need to lookup by code
    if (q?.moduleId) {
      this.moduleId.set(q.moduleId);
    }

    this.readinessService.getModuleList().subscribe({
      next: (mods) => {
        this.moduleList.set(mods);
        // fallback for old questions that don't have moduleId yet - lookup by code
        if (q && !q.moduleId && q.moduleCode) {
          const found = mods.find((m) => m.moduleCode === q.moduleCode);
          if (found) this.moduleId.set(found.id);
        }
        // re-assign so the <select> re-binds after the <option> elements exist
        // (Angular [value] on a select doesn't auto-pick when options arrive later)
        const current = this.moduleId();
        if (current) {
          queueMicrotask(() => this.moduleId.set(current));
        }
      },
      error: () => {
        console.error('Failed to load modules for dropdown');
      },
    });

    this.topics = this.readinessService.getTopics();

    if (q) {
      this.title.set(q.title);
      this.questionText.set(q.questionText);
      this.questionType.set(q.questionType);
      this.difficulty.set(q.difficulty);
      this.topic.set(q.topic);
      this.module.set(q.module);
      this.moduleCode.set(q.moduleCode);
      this.marks.set(q.marks);
      this.status.set(q.status);
      this.explanation.set(q.explanation);
      this.correctOptionId.set(q.correctOptionId);
      this.isActive.set(q.status === 'Active');

      if (q.options.length > 0) {
        this.options.set([...q.options]);
      }
    }
  }

  // when user selects a module from the dropdown, save the GUID
  onModuleSelect(id: string) {
    this.moduleId.set(id);
    const mod = this.moduleList().find((m) => m.id === id);
    if (mod) {
      this.module.set(mod.moduleName);
      this.moduleCode.set(mod.moduleCode);
    }
  }

  // set the correct answer when user clicks on a radio button
  setCorrectAnswer(optionId: string) {
    this.correctOptionId.set(optionId);

    // update the isCorrect flag on all options
    this.options.update((opts) =>
      opts.map((o) => ({ ...o, isCorrect: o.id === optionId }))
    );
  }

  // update option text when user types
  updateOptionText(optionId: string, text: string) {
    this.options.update((opts) =>
      opts.map((o) => (o.id === optionId ? { ...o, optionText: text } : o))
    );
  }

  // add a new option
  addOption() {
    const currentOptions = this.options();
    // generate next letter id (e, f, g, etc.)
    const nextId = String.fromCharCode(97 + currentOptions.length);
    this.options.update((opts) => [
      ...opts,
      { id: nextId, optionText: '', isCorrect: false },
    ]);
  }

  // remove an option
  removeOption(optionId: string) {
    // don't allow less than 2 options
    if (this.options().length <= 2) return;

    this.options.update((opts) => opts.filter((o) => o.id !== optionId));

    // if the removed option was the correct answer, clear it
    if (this.correctOptionId() === optionId) {
      this.correctOptionId.set('');
    }
  }

  // toggle status between Active and Draft
  toggleStatus() {
    this.isActive.update((v) => !v);
    this.status.set(this.isActive() ? 'Active' : 'Draft');
  }

  // submit the form - only if valid
  onSubmit() {
    this.submitted.set(true);
    if (!this.isFormValid()) return;

    const data: any = {
      title: this.title(),
      questionText: this.questionText(),
      questionType: this.questionType(),
      difficulty: this.difficulty(),
      topic: this.topic(),
      module: this.module(),
      moduleCode: this.moduleCode(),
      moduleId: this.moduleId(), // GUID - backend needs this
      marks: this.marks(),
      status: this.status(),
      explanation: this.explanation(),
      options: this.options(),
      correctOptionId: this.correctOptionId(),
    };

    this.formSubmit.emit(data);
  }

  // cancel editing
  onCancel() {
    this.formCancel.emit();
  }
}
