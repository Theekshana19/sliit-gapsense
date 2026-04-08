import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AssessmentLayoutComponent } from '../../../components/layout/assessment-layout/assessment-layout';
import { ConfirmPromptDialogComponent } from '../../../components/ui/confirm-dialog/confirm-prompt-dialog';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { AuthUiService } from '../../../services/auth-ui.service';
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
  imports: [AssessmentLayoutComponent, ConfirmPromptDialogComponent, LoadingSpinnerComponent],
  templateUrl: './quiz-attempt.html',
  styleUrl: './quiz-attempt.css',
})
export class QuizAttemptComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readinessService = inject(ReadinessService);
  private toastService = inject(ToastService);
  private authUi = inject(AuthUiService);

  isLoading = signal(true);
  quiz = signal<Quiz | null>(null);
  questions = signal<Question[]>([]);

  readonly quizHeading = computed(() => {
    const q = this.quiz();
    if (!q) return 'Quiz';
    return [q.moduleCode, q.title].filter(Boolean).join(' · ');
  });

  readonly displayStudentName = computed(() => this.authUi.currentUser()?.fullName ?? 'Student');

  readonly displayStudentInitials = computed(() => {
    const name = this.authUi.currentUser()?.fullName?.trim();
    if (!name) return 'ST';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return (parts[0]?.slice(0, 2) ?? 'ST').toUpperCase();
  });

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

    if (!quizId) {
      this.isLoading.set(false);
      this.toastService.error('No quiz ID provided');
      return;
    }

    forkJoin({
      quiz: this.readinessService.getQuizById(quizId),
      questions: this.readinessService.getQuizQuestions(quizId),
    }).subscribe({
      next: ({ quiz, questions }) => {
        if (!quiz) {
          this.toastService.error('Quiz not found');
          this.isLoading.set(false);
          return;
        }
        this.quiz.set(quiz);
        this.questions.set(questions);
        this.timeRemaining.set(quiz.timeLimitMinutes * 60);
        this.startTimer();
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load quiz');
        this.isLoading.set(false);
      },
    });
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  get currentQuestion(): Question | null {
    return this.questions()[this.currentIndex()] || null;
  }

  get totalQuestions(): number {
    return this.questions().length;
  }

  get answeredCount(): number {
    return this.answers().size;
  }

  isAnswered(index: number): boolean {
    const q = this.questions()[index];
    return q ? this.answers().has(q.id) : false;
  }

  isOptionSelected(optionId: string): boolean {
    const q = this.currentQuestion;
    if (!q) return false;
    return this.answers().get(q.id) === optionId;
  }

  selectOption(optionId: string) {
    const q = this.currentQuestion;
    if (!q) return;

    const newAnswers = new Map(this.answers());
    newAnswers.set(q.id, optionId);
    this.answers.set(newAnswers);
  }

  nextQuestion() {
    if (this.currentIndex() < this.totalQuestions - 1) {
      this.currentIndex.update((i) => i + 1);
    }
  }

  prevQuestion() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((i) => i - 1);
    }
  }

  goToQuestion(index: number) {
    this.currentIndex.set(index);
  }

  startTimer() {
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.timeRemaining.update((t) => t - 1);
      this.updateTimerDisplay();

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
    this.timerDisplay.set(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
  }

  confirmSubmit() {
    this.showSubmitDialog.set(true);
  }

  cancelSubmit() {
    this.showSubmitDialog.set(false);
  }

  submitQuiz() {
    this.stopTimer();
    this.showSubmitDialog.set(false);

    const quizId = this.quiz()?.id || '';
    const answerList = Array.from(this.answers().entries()).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }));

    const identity = this.buildSubmitIdentity();
    if (!identity) return;

    this.readinessService.submitQuiz(quizId, answerList, identity).subscribe({
      next: (submission) => {
        this.toastService.success(
          `Quiz submitted! You scored ${submission.score}/${submission.totalMarks} (${submission.percentage}%)`
        );
        void this.router.navigate(['/readiness/attempt-history']);
      },
      error: (err: unknown) => {
        this.toastService.error(this.submitErrorMessage(err));
      },
    });
  }

  private buildSubmitIdentity():
    | { studentId: string; studentName: string; studentAvatar: string; avatarColor: string }
    | null {
    const u = this.authUi.currentUser();
    if (!u) {
      this.toastService.error('Sign in to submit your answers.');
      return null;
    }

    if (u.role === 'student' && !u.studentId?.trim()) {
      this.toastService.error('Add your Student ID under Profile so your attempt is recorded.');
      return null;
    }

    const raw = (u.role === 'student' ? u.studentId! : u.staffId || u.userId).trim();
    if (!raw) {
      this.toastService.error('Your account is missing an ID. Update your profile.');
      return null;
    }

    const studentId = raw.length > 20 ? raw.slice(0, 20) : raw;
    const parts = u.fullName.trim().split(/\s+/).filter(Boolean);
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`
        : (parts[0]?.slice(0, 2) ?? 'ST');

    return {
      studentId,
      studentName: u.fullName,
      studentAvatar: initials.toUpperCase(),
      avatarColor: 'bg-primary-fixed',
    };
  }

  private submitErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (body && typeof body === 'object' && 'message' in body && typeof (body as { message: string }).message === 'string') {
        return (body as { message: string }).message;
      }
      if (err.status === 0) return 'Network error — is the API running?';
    }
    if (err instanceof Error && err.message) return err.message;
    return 'Could not submit quiz';
  }
}
