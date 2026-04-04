import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { roleGuard } from './guards/role.guard';
import { MANAGEMENT_ROLES } from './models/auth/auth-role.model';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/login/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'auth/signup/student',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/signup-student/signup-student-page.component').then((m) => m.SignupStudentPageComponent),
  },
  {
    path: 'auth/signup/lecturer',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/signup-lecturer/signup-lecturer-page.component').then((m) => m.SignupLecturerPageComponent),
  },
  {
    path: 'auth/signup/admin',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/signup-admin/signup-admin-page.component').then((m) => m.SignupAdminPageComponent),
  },
  {
    path: 'auth/signup',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/signup-role/signup-role-page.component').then((m) => m.SignupRolePageComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/auth/profile-management/profile-management-page.component').then((m) => m.ProfileManagementPageComponent),
  },
  {
    path: 'risk-thresholds',
    canActivate: [authGuard, roleGuard(MANAGEMENT_ROLES)],
    loadComponent: () =>
      import('./pages/risk-analysis/risk-threshold-management/risk-threshold-management.component').then(
        (m) => m.RiskThresholdManagementComponent
      ),
  },
  {
    path: 'recommendation-rules/add',
    canActivate: [authGuard, roleGuard(MANAGEMENT_ROLES)],
    loadComponent: () =>
      import('./pages/risk-analysis/add-recommendation-rule/add-recommendation-rule.component').then(
        (m) => m.AddRecommendationRuleComponent
      ),
  },
  {
    path: 'recommendation-rules/:id/edit',
    canActivate: [authGuard, roleGuard(MANAGEMENT_ROLES)],
    loadComponent: () =>
      import('./pages/risk-analysis/add-recommendation-rule/add-recommendation-rule.component').then(
        (m) => m.AddRecommendationRuleComponent
      ),
  },
  {
    path: 'recommendation-rules',
    canActivate: [authGuard, roleGuard(MANAGEMENT_ROLES)],
    loadComponent: () =>
      import('./pages/risk-analysis/recommendation-rule-management/recommendation-rule-management.component').then(
        (m) => m.RecommendationRuleManagementComponent
      ),
  },
  {
    path: 'readiness-results',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/risk-analysis/readiness-result/readiness-result.component').then(
        (m) => m.ReadinessResultComponent
      ),
  },
  {
    path: 'weak-topic-analysis',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/risk-analysis/weak-topic-analysis/weak-topic-analysis.component').then(
        (m) => m.WeakTopicAnalysisComponent
      ),
  },
  {
    path: 'recommendations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/risk-analysis/personalized-recommendations/personalized-recommendations.component').then(
        (m) => m.PersonalizedRecommendationsComponent
      ),
  },
  {
    path: 'student-profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/risk-analysis/student-readiness-profile/student-readiness-profile.component').then(
        (m) => m.StudentReadinessProfileComponent
      ),
  },
  {
    path: 'learning-path',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/risk-analysis/personalized-learning-path/personalized-learning-path.component').then(
        (m) => m.PersonalizedLearningPathComponent
      ),
  },
  {
    path: 'reassessment-comparison',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/risk-analysis/reassessment-comparison/reassessment-comparison.component').then(
        (m) => m.ReassessmentComparisonComponent
      ),
  },
  {
    path: 'risk-trends',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/risk-analysis/risk-trends-summary/risk-trends-summary.component').then(
        (m) => m.RiskTrendsSummaryComponent
      ),
  },
  // readiness module routes (quiz questions, quiz builder, quiz attempt, attempt history)
  {
    path: 'readiness',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'question-bank', pathMatch: 'full' },
      {
        path: 'question-bank',
        canActivate: [authGuard, roleGuard(MANAGEMENT_ROLES)],
        loadComponent: () =>
          import('./pages/readiness/question-bank/question-bank').then((m) => m.QuestionBankComponent),
      },
      {
        path: 'questions/new',
        canActivate: [authGuard, roleGuard(MANAGEMENT_ROLES)],
        loadComponent: () =>
          import('./pages/readiness/question-bank/add-edit-question/add-edit-question').then((m) => m.AddEditQuestionComponent),
      },
      {
        path: 'questions/:id/edit',
        canActivate: [authGuard, roleGuard(MANAGEMENT_ROLES)],
        loadComponent: () =>
          import('./pages/readiness/question-bank/add-edit-question/add-edit-question').then((m) => m.AddEditQuestionComponent),
      },
      {
        path: 'quiz-builder',
        canActivate: [authGuard, roleGuard(MANAGEMENT_ROLES)],
        loadComponent: () =>
          import('./pages/readiness/quiz-builder/quiz-builder').then((m) => m.QuizBuilderComponent),
      },
      {
        path: 'quiz-scheduling',
        canActivate: [authGuard, roleGuard(MANAGEMENT_ROLES)],
        loadComponent: () =>
          import('./pages/readiness/quiz-scheduling/quiz-scheduling').then((m) => m.QuizSchedulingComponent),
      },
      {
        path: 'quiz-attempt/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/readiness/quiz-attempt/quiz-attempt').then((m) => m.QuizAttemptComponent),
      },
      {
        path: 'submission-tracking',
        canActivate: [authGuard, roleGuard(MANAGEMENT_ROLES)],
        loadComponent: () =>
          import('./pages/readiness/submission-tracking/submission-tracking').then((m) => m.SubmissionTrackingComponent),
      },
      {
        path: 'attempt-history',
        canActivate: [authGuard, roleGuard(MANAGEMENT_ROLES)],
        loadComponent: () =>
          import('./pages/readiness/attempt-history/attempt-history').then((m) => m.AttemptHistoryComponent),
      },
    ],
  },

  // curriculum module routes (modules/topics/prerequisites/resources)
  {
    path: 'curriculum',
    canActivate: [authGuard, roleGuard(MANAGEMENT_ROLES)],
    children: [
      { path: '', redirectTo: 'module-management', pathMatch: 'full' },
      {
        path: 'module-management',
        loadComponent: () =>
          import('./pages/curriculum/module-management/module-management').then((m) => m.ModuleManagementComponent),
      },
      {
        path: 'modules/new',
        loadComponent: () =>
          import('./pages/curriculum/add-edit-module/add-edit-module').then((m) => m.AddEditModuleComponent),
      },
      {
        path: 'modules/:id/edit',
        loadComponent: () =>
          import('./pages/curriculum/add-edit-module/add-edit-module').then((m) => m.AddEditModuleComponent),
      },
      {
        path: 'modules/:moduleId/topics',
        loadComponent: () =>
          import('./pages/curriculum/topic-management/topic-management').then((m) => m.TopicManagementComponent),
      },
      {
        path: 'topics/new',
        loadComponent: () =>
          import('./pages/curriculum/add-edit-topic/add-edit-topic').then((m) => m.AddEditTopicComponent),
      },
      {
        path: 'topics/:id/edit',
        loadComponent: () =>
          import('./pages/curriculum/add-edit-topic/add-edit-topic').then((m) => m.AddEditTopicComponent),
      },
      {
        path: 'topic-weight-config/:moduleId',
        loadComponent: () =>
          import('./pages/curriculum/topic-weight-config/topic-weight-config').then((m) => m.TopicWeightConfigComponent),
      },
      {
        path: 'prerequisite-mapping',
        loadComponent: () =>
          import('./pages/curriculum/prerequisite-mapping/prerequisite-mapping').then((m) => m.PrerequisiteMappingComponent),
      },
      {
        path: 'prerequisite-management',
        loadComponent: () =>
          import('./pages/curriculum/prerequisite-management/prerequisite-management').then((m) => m.PrerequisiteManagementComponent),
      },
      {
        path: 'dependency-visualization',
        loadComponent: () =>
          import('./pages/curriculum/dependency-visualization/dependency-visualization').then((m) => m.DependencyVisualizationComponent),
      },
      {
        path: 'semester-offerings',
        loadComponent: () =>
          import('./pages/curriculum/semester-offerings/semester-offerings').then((m) => m.SemesterOfferingsComponent),
      },
      {
        path: 'validation-alerts',
        loadComponent: () =>
          import('./pages/curriculum/validation-alerts/validation-alerts').then((m) => m.ValidationAlertsComponent),
      },
    ],
  },

  // notifications module routes (Tharindu's monitoring/interventions pages)
  {
    path: 'monitoring',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'plans', pathMatch: 'full' },
      {
        path: 'plans',
        loadComponent: () =>
          import('./pages/monitoring/plans/plans.component').then((m) => m.MonitoringPlansPageComponent),
      },
      {
        path: 'intervention-plan',
        loadComponent: () =>
          import('./pages/monitoring/intervention-plan/intervention-plan.component').then((m) => m.InterventionPlanPageComponent),
      },
      {
        path: 'follow-ups',
        loadComponent: () =>
          import('./pages/monitoring/follow-ups/follow-ups.component').then((m) => m.FollowUpsPageComponent),
      },
    ],
  },

  { path: '**', redirectTo: 'auth/login' },
];
