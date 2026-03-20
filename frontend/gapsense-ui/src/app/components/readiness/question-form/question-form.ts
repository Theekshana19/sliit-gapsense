import { Component, input, output, signal, OnInit, inject } from '@angular/core';
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

  // available modules and topics for dropdowns
  modules: string[] = [];
  topics: string[] = [];

  // status toggle - true means Active, false means Draft
  isActive = signal(false);

  ngOnInit() {
    // load dropdown options
    this.modules = this.readinessService.getModules();
    this.topics = this.readinessService.getTopics();

    // if editing an existing question, fill the form with its data
    const q = this.question();
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

      // copy the options
      if (q.options.length > 0) {
        this.options.set([...q.options]);
      }
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

  // submit the form
  onSubmit() {
    const data: Partial<Question> = {
      title: this.title(),
      questionText: this.questionText(),
      questionType: this.questionType(),
      difficulty: this.difficulty(),
      topic: this.topic(),
      module: this.module(),
      moduleCode: this.moduleCode(),
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
