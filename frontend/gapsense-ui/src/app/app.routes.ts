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

  // curriculum module routes (Sewwandi's pages)
  {
    path: 'curriculum',
    children: [
      // page 1 - module management (list all modules)
      {
        path: 'module-management',
        loadComponent: () =>
          import('./pages/curriculum/module-management/module-management').then(
            (m) => m.ModuleManagementComponent
          ),
      },

      // page 2 - add new module
      {
        path: 'modules/new',
        loadComponent: () =>
          import('./pages/curriculum/add-edit-module/add-edit-module').then(
            (m) => m.AddEditModuleComponent
          ),
      },

      // page 2 - edit existing module
      {
        path: 'modules/:id/edit',
        loadComponent: () =>
          import('./pages/curriculum/add-edit-module/add-edit-module').then(
            (m) => m.AddEditModuleComponent
          ),
      },

      // page 3 - topic management for a module
      {
        path: 'modules/:moduleId/topics',
        loadComponent: () =>
          import('./pages/curriculum/topic-management/topic-management').then(
            (m) => m.TopicManagementComponent
          ),
      },

      // page 4 - add new topic
      {
        path: 'topics/new',
        loadComponent: () =>
          import('./pages/curriculum/add-edit-topic/add-edit-topic').then(
            (m) => m.AddEditTopicComponent
          ),
      },

      // page 4 - edit existing topic
      {
        path: 'topics/:id/edit',
        loadComponent: () =>
          import('./pages/curriculum/add-edit-topic/add-edit-topic').then(
            (m) => m.AddEditTopicComponent
          ),
      },

      // page 5 - topic weight configuration
      {
        path: 'topic-weight-config/:moduleId',
        loadComponent: () =>
          import('./pages/curriculum/topic-weight-config/topic-weight-config').then(
            (m) => m.TopicWeightConfigComponent
          ),
      },

      // page 6 - prerequisite mapping form
      {
        path: 'prerequisite-mapping',
        loadComponent: () =>
          import('./pages/curriculum/prerequisite-mapping/prerequisite-mapping').then(
            (m) => m.PrerequisiteMappingComponent
          ),
      },

      // page 7 - prerequisite management table
      {
        path: 'prerequisite-management',
        loadComponent: () =>
          import('./pages/curriculum/prerequisite-management/prerequisite-management').then(
            (m) => m.PrerequisiteManagementComponent
          ),
      },

      // page 8 - dependency visualization graph
      {
        path: 'dependency-visualization',
        loadComponent: () =>
          import('./pages/curriculum/dependency-visualization/dependency-visualization').then(
            (m) => m.DependencyVisualizationComponent
          ),
      },

      // page 9 - semester module offerings
      {
        path: 'semester-offerings',
        loadComponent: () =>
          import('./pages/curriculum/semester-offerings/semester-offerings').then(
            (m) => m.SemesterOfferingsComponent
          ),
      },

      // page 10 - validation alerts
      {
        path: 'validation-alerts',
        loadComponent: () =>
          import('./pages/curriculum/validation-alerts/validation-alerts').then(
            (m) => m.ValidationAlertsComponent
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
