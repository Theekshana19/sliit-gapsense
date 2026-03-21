import { Routes } from '@angular/router';

// all routes for the application
// using lazy loading - each page loads only when needed
export const routes: Routes = [
  // default route - redirect to question bank
  {
    path: '',
    redirectTo: 'readiness/question-bank',
    pathMatch: 'full',
  },

  // readiness module routes (Chamodi's pages)
  {
    path: 'readiness',
    children: [
      // page 1 - question bank (browse all questions)
      {
        path: 'question-bank',
        loadComponent: () =>
          import('./pages/readiness/question-bank/question-bank').then(
            (m) => m.QuestionBankComponent
          ),
      },

      // page 2 - add new question
      {
        path: 'questions/new',
        loadComponent: () =>
          import('./pages/readiness/question-bank/add-edit-question/add-edit-question').then(
            (m) => m.AddEditQuestionComponent
          ),
      },

      // page 2 - edit existing question
      {
        path: 'questions/:id/edit',
        loadComponent: () =>
          import('./pages/readiness/question-bank/add-edit-question/add-edit-question').then(
            (m) => m.AddEditQuestionComponent
          ),
      },

      // page 3 - quiz builder (create quizzes)
      {
        path: 'quiz-builder',
        loadComponent: () =>
          import('./pages/readiness/quiz-builder/quiz-builder').then(
            (m) => m.QuizBuilderComponent
          ),
      },

      // page 4 - quiz scheduling (set availability)
      {
        path: 'quiz-scheduling',
        loadComponent: () =>
          import('./pages/readiness/quiz-scheduling/quiz-scheduling').then(
            (m) => m.QuizSchedulingComponent
          ),
      },

      // page 5 - quiz attempt (student takes the quiz)
      {
        path: 'quiz-attempt/:id',
        loadComponent: () =>
          import('./pages/readiness/quiz-attempt/quiz-attempt').then(
            (m) => m.QuizAttemptComponent
          ),
      },

      // page 6 - submission tracking (monitor students)
      {
        path: 'submission-tracking',
        loadComponent: () =>
          import('./pages/readiness/submission-tracking/submission-tracking').then(
            (m) => m.SubmissionTrackingComponent
          ),
      },

      // page 7 - attempt history (past attempts)
      {
        path: 'attempt-history',
        loadComponent: () =>
          import('./pages/readiness/attempt-history/attempt-history').then(
            (m) => m.AttemptHistoryComponent
          ),
      },
    ],
  },

  // catch all - redirect to question bank
  {
    path: '**',
    redirectTo: 'readiness/question-bank',
  },
];
