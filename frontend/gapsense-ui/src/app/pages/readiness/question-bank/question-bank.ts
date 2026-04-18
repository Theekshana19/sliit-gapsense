import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MemberShellComponent } from '../../../components/layout/member-shell/member-shell.component';
import { PillBadgeComponent } from '../../../components/ui/pill-badge/pill-badge.component';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { EmptyStateComponent } from '../../../components/ui/empty-state/empty-state.component';
import { ConfirmPromptDialogComponent } from '../../../components/ui/confirm-dialog/confirm-prompt-dialog';
import { ReadinessService } from '../../../services/readiness.service';
import { ToastService } from '../../../services/toast.service';
import { Question, QuestionFilter, DifficultyLevel, QuestionStatus } from '../../../models/readiness/question.model';

// question bank page - browse, filter, and manage all questions
// this is the main page lecturers see when they open the readiness module
@Component({
  selector: 'app-question-bank',
  standalone: true,
  imports: [
    MemberShellComponent,
    PillBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmPromptDialogComponent,
  ],
  templateUrl: './question-bank.html',
})
export class QuestionBankComponent implements OnInit {
  private readinessService = inject(ReadinessService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // loading state
  isLoading = signal(true);

  // all questions from the service
  questions = signal<Question[]>([]);

  // filter values
  filterModule = signal('');
  filterTopic = signal('');
  filterDifficulty = signal<DifficultyLevel | ''>('');
  filterStatus = signal<QuestionStatus | ''>('');

  // dropdown options
  modules: string[] = [];
  topics: string[] = [];

  // pagination
  currentPage = signal(1);
  pageSize = 10;

  // delete confirmation dialog
  showDeleteDialog = signal(false);
  questionToDelete = signal<Question | null>(null);

  ngOnInit() {
    this.modules = this.readinessService.getModules();
    this.topics = this.readinessService.getTopics();
    this.loadQuestions();
  }

  // load questions with current filters
  loadQuestions() {
    this.isLoading.set(true);

    const filter: QuestionFilter = {
      module: this.filterModule(),
      topic: this.filterTopic(),
      difficulty: this.filterDifficulty() || undefined,
      status: this.filterStatus() || undefined,
    };

    this.readinessService.getQuestions(filter).subscribe((data) => {
      this.questions.set(data);
      this.isLoading.set(false);
    });
  }

  // filter change handlers
  onModuleChange(value: string) {
    this.filterModule.set(value);
    this.currentPage.set(1);
    this.loadQuestions();
  }

  onTopicChange(value: string) {
    this.filterTopic.set(value);
    this.currentPage.set(1);
    this.loadQuestions();
  }

  onDifficultyChange(value: string) {
    this.filterDifficulty.set(value as DifficultyLevel | '');
    this.currentPage.set(1);
    this.loadQuestions();
  }

  onStatusChange(value: string) {
    this.filterStatus.set(value as QuestionStatus | '');
    this.currentPage.set(1);
    this.loadQuestions();
  }

  // get paginated questions for current page
  get paginatedQuestions(): Question[] {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.questions().slice(start, start + this.pageSize);
  }

  // total pages
  get totalPages(): number {
    return Math.ceil(this.questions().length / this.pageSize);
  }

  // navigate to add question page
  goToAddQuestion() {
    this.router.navigate(['/readiness/questions/new']);
  }

  // navigate to edit question page
  goToEditQuestion(id: string) {
    this.router.navigate(['/readiness/questions', id, 'edit']);
  }

  // show delete confirmation
  confirmDelete(question: Question) {
    this.questionToDelete.set(question);
    this.showDeleteDialog.set(true);
  }

  // delete the question after confirmation
  onDeleteConfirmed() {
    const question = this.questionToDelete();
    if (question) {
      this.readinessService.deleteQuestion(question.id).subscribe({
        next: () => {
          this.toastService.success('Question deleted successfully');
          this.showDeleteDialog.set(false);
          this.questionToDelete.set(null);
          this.loadQuestions();
        },
        error: (err: unknown) => {
          let msg = 'Could not delete question.';
          if (err && typeof err === 'object') {
            const e = err as { message?: string; error?: unknown };
            if (typeof e.message === 'string' && e.message.trim()) {
              msg = e.message;
            } else if (e.error && typeof e.error === 'object' && e.error !== null) {
              const body = e.error as { message?: string };
              if (typeof body.message === 'string' && body.message.trim()) {
                msg = body.message;
              }
            }
          }
          this.toastService.error(msg);
          this.showDeleteDialog.set(false);
          this.questionToDelete.set(null);
        },
      });
    }
  }

  // cancel delete
  onDeleteCancelled() {
    this.showDeleteDialog.set(false);
    this.questionToDelete.set(null);
  }

  // go to a specific page
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage.set(page);
    }
  }

  // get difficulty badge variant
  getDifficultyVariant(difficulty: string): 'primary' | 'error' | 'neutral' {
    switch (difficulty) {
      case 'Hard': return 'error';
      case 'Medium': return 'primary';
      default: return 'neutral';
    }
  }

  // get status badge variant
  getStatusVariant(status: string): 'primary' | 'error' | 'neutral' {
    switch (status) {
      case 'Active': return 'primary';
      case 'Archived': return 'error';
      default: return 'neutral';
    }
  }

  // stats computed from questions
  get totalQuestions(): number { return this.questions().length; }
  get activeCount(): number { return this.questions().filter(q => q.status === 'Active').length; }
  get draftCount(): number { return this.questions().filter(q => q.status === 'Draft').length; }
}
