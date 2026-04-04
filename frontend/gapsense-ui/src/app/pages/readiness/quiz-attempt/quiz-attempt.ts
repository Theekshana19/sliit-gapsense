import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentLayoutComponent } from '../../../components/layout/assessment-layout/assessment-layout';
import { ConfirmDialogComponent } from '../../../components/ui/confirm-dialog/confirm-dialog';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { ReadinessService } from '../../../services/readiness.service';
import { ToastService } from '../../../services/toast.service';
import { Question } from '../../../models/readiness/question.model';
import { Quiz } from '../../../models/readiness/quiz.model';

// quiz attempt page - student takes the quiz here
// this page has NO sidebar - uses the assessment layout with timer
// shows one question at a time with navigation grid
@Component({
  selector: 'app-quiz-attempt',
  standalone: true,
  imports: [AssessmentLayoutComponent, ConfirmDialogComponent, LoadingSpinnerComponent],
  templateUrl: './quiz-attempt.html',
  styleUrl: './quiz-attempt.css',
})
export class QuizAttemptComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readinessService = inject(ReadinessService);
  private toastService = inject(ToastService);

  isLoading = signal(true);
  quiz = signal<Quiz | null>(null);
  questions = signal<Question[]>([]);

  // current question index (0-based)
  currentIndex = signal(0);

  // student's answers - maps questionId to selected optionId
  answers = signal<Map<string, string>>(new Map());

  // timer
  timeRemaining = signal(0); // in seconds
  timerDisplay = signal('00:00');
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // submit confirmation dialog
  showSubmitDialog = signal(false);

  ngOnInit() {
    const quizId = this.route.snapshot.paramMap.get('id') || '';

    // if no quiz ID in the URL, show error
    if (!quizId) {
      this.isLoading.set(false);
      this.toastService.error('No quiz ID provided');
      return;
    }

    // load quiz details
    this.readinessService.getQuizById(quizId).subscribe({
      next: (q) => {
        if (q) {
          this.quiz.set(q);
          this.timeRemaining.set(q.timeLimitMinutes * 60);
          this.startTimer();
        }
      },
      error: () => {
        this.toastService.error('Failed to load quiz');
        this.isLoading.set(false);
      },
    });

    // load quiz questions
    this.readinessService.getQuizQuestions(quizId).subscribe({
      next: (questions) => {
        this.questions.set(questions);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load questions');
        this.isLoading.set(false);
      },
    });
  }

  ngOnDestroy() {
    // clean up timer when leaving the page
    this.stopTimer();
  }

  // get the current question
  get currentQuestion(): Question | null {
    return this.questions()[this.currentIndex()] || null;
  }

  // total number of questions
  get totalQuestions(): number {
    return this.questions().length;
  }

  // how many questions have been answered
  get answeredCount(): number {
    return this.answers().size;
  }

  // check if a specific question has been answered
  isAnswered(index: number): boolean {
    const q = this.questions()[index];
    return q ? this.answers().has(q.id) : false;
  }

  // check if an option is selected for the current question
  isOptionSelected(optionId: string): boolean {
    const q = this.currentQuestion;
    if (!q) return false;
    return this.answers().get(q.id) === optionId;
  }

  // select an answer option
  selectOption(optionId: string) {
    const q = this.currentQuestion;
    if (!q) return;

    const newAnswers = new Map(this.answers());
    newAnswers.set(q.id, optionId);
    this.answers.set(newAnswers);
  }

  // go to next question
  nextQuestion() {
    if (this.currentIndex() < this.totalQuestions - 1) {
      this.currentIndex.update((i) => i + 1);
    }
  }

  // go to previous question
  prevQuestion() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((i) => i - 1);
    }
  }

  // jump to a specific question
  goToQuestion(index: number) {
    this.currentIndex.set(index);
  }

  // --- timer logic ---

  startTimer() {
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.timeRemaining.update((t) => t - 1);
      this.updateTimerDisplay();

      // auto submit when time runs out
      if (this.timeRemaining() <= 0) {
        this.stopTimer();
        this.submitQuiz();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimerDisplay() {
    const total = this.timeRemaining();
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    this.timerDisplay.set(
      `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    );
  }

  // --- submit logic ---

  // show confirmation dialog
  confirmSubmit() {
    this.showSubmitDialog.set(true);
  }

  // cancel submit
  cancelSubmit() {
    this.showSubmitDialog.set(false);
  }

  // actually submit the quiz
  submitQuiz() {
    this.stopTimer();
    this.showSubmitDialog.set(false);

    const quizId = this.quiz()?.id || '';
    const answerList = Array.from(this.answers().entries()).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }));

    this.readinessService.submitQuiz(quizId, answerList).subscribe((submission) => {
      this.toastService.success(
        `Quiz submitted! You scored ${submission.score}/${submission.totalMarks} (${submission.percentage}%)`
      );
      this.router.navigate(['/readiness/attempt-history']);
    });
  }
}
