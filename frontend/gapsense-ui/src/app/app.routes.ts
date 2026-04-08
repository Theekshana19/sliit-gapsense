import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { roleGuard } from './guards/role.guard';
import {
  ADMIN_AND_LECTURER_ROLES,
  ADMIN_ROLES,
  ALL_AUTHENTICATED_ROLES,
  LECTURER_OR_STUDENT_ROLES,
  LECTURER_ROLES,
  STUDENT_ROLES,
} from './models/auth/auth-role.model';

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
    path: 'dashboard',
    canActivate: [authGuard, roleGuard(ALL_AUTHENTICATED_ROLES)],
    loadComponent: () =>
      import('./pages/dashboard/dashboard/dashboard.component').then((m) => m.DashboardPageComponent),
  },
  {
    path: 'risk-thresholds',
    canActivate: [authGuard, roleGuard(ADMIN_ROLES)],
    loadComponent: () =>
      import('./pages/risk-analysis/risk-threshold-management/risk-threshold-management.component').then(
        (m) => m.RiskThresholdManagementComponent
      ),
  },
  {
    path: 'recommendation-rules/add',
    canActivate: [authGuard, roleGuard(ADMIN_ROLES)],
    loadComponent: () =>
      import('./pages/risk-analysis/add-recommendation-rule/add-recommendation-rule.component').then(
        (m) => m.AddRecommendationRuleComponent
      ),
  },
  {
    path: 'recommendation-rules/:id/edit',
    canActivate: [authGuard, roleGuard(ADMIN_ROLES)],
    loadComponent: () =>
      import('./pages/risk-analysis/add-recommendation-rule/add-recommendation-rule.component').then(
        (m) => m.AddRecommendationRuleComponent
      ),
  },
  {
    path: 'recommendation-rules',
    canActivate: [authGuard, roleGuard(ADMIN_ROLES)],
    loadComponent: () =>
      import('./pages/risk-analysis/recommendation-rule-management/recommendation-rule-management.component').then(
        (m) => m.RecommendationRuleManagementComponent
      ),
  },
  {
    path: 'readiness-results',
    canActivate: [authGuard, roleGuard(LECTURER_OR_STUDENT_ROLES)],
    loadComponent: () =>
      import('./pages/risk-analysis/readiness-result/readiness-result.component').then(
        (m) => m.ReadinessResultComponent
      ),
  },
  {
    path: 'weak-topic-analysis',
    canActivate: [authGuard, roleGuard(LECTURER_OR_STUDENT_ROLES)],
    loadComponent: () =>
      import('./pages/risk-analysis/weak-topic-analysis/weak-topic-analysis.component').then(
        (m) => m.WeakTopicAnalysisComponent
      ),
  },
  {
    path: 'recommendations',
    canActivate: [authGuard, roleGuard(LECTURER_OR_STUDENT_ROLES)],
    loadComponent: () =>
      import('./pages/risk-analysis/personalized-recommendations/personalized-recommendations.component').then(
        (m) => m.PersonalizedRecommendationsComponent
      ),
  },
  {
    path: 'student-profile',
    canActivate: [authGuard, roleGuard(LECTURER_OR_STUDENT_ROLES)],
    loadComponent: () =>
      import('./pages/risk-analysis/student-readiness-profile/student-readiness-profile.component').then(
        (m) => m.StudentReadinessProfileComponent
      ),
  },
  {
    path: 'learning-path',
    canActivate: [authGuard, roleGuard(STUDENT_ROLES)],
    loadComponent: () =>
      import('./pages/risk-analysis/personalized-learning-path/personalized-learning-path.component').then(
        (m) => m.PersonalizedLearningPathComponent
      ),
  },
  {
    path: 'reassessment-comparison',
    canActivate: [authGuard, roleGuard(LECTURER_OR_STUDENT_ROLES)],
    loadComponent: () =>
      import('./pages/risk-analysis/reassessment-comparison/reassessment-comparison.component').then(
        (m) => m.ReassessmentComparisonComponent
      ),
  },
  {
    path: 'risk-trends',
    canActivate: [authGuard, roleGuard(STUDENT_ROLES)],
    loadComponent: () =>
      import('./pages/risk-analysis/risk-trends-summary/risk-trends-summary.component').then(
        (m) => m.RiskTrendsSummaryComponent
      ),
  },
  { path: 'reports-export', redirectTo: '/risk-analysis/reports', pathMatch: 'full' },
  { path: 'notification-center', redirectTo: '/notifications', pathMatch: 'full' },
  { path: 'intervention-planning', redirectTo: '/monitoring/plans', pathMatch: 'full' },
  { path: 'follow-up-management', redirectTo: '/monitoring/follow-ups', pathMatch: 'full' },
  { path: 'high-risk-monitoring', redirectTo: '/risk-analysis/heatmap', pathMatch: 'full' },
  {
    path: 'monitoring',
    canActivate: [authGuard, roleGuard(ADMIN_AND_LECTURER_ROLES)],
    loadComponent: () =>
      import('./components/layout/tharindu-shell/tharindu-main-layout.component').then(
        (m) => m.TharinduShellLayoutComponent
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'plans' },
      {
        path: 'plans',
        loadComponent: () =>
          import('./pages/monitoring/plans/plans.component').then((m) => m.MonitoringPlansPageComponent),
      },
      {
        path: 'intervention-plan',
        loadComponent: () =>
          import('./pages/monitoring/intervention-plan/intervention-plan.component').then(
            (m) => m.InterventionPlanPageComponent
          ),
      },
      {
        path: 'follow-ups',
        loadComponent: () =>
          import('./pages/monitoring/follow-ups/follow-ups.component').then((m) => m.FollowUpsPageComponent),
      },
    ],
  },
  {
    path: 'risk-analysis',
    canActivate: [authGuard, roleGuard(ADMIN_AND_LECTURER_ROLES)],
    loadComponent: () =>
      import('./components/layout/tharindu-shell/tharindu-main-layout.component').then(
        (m) => m.TharinduShellLayoutComponent
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'reports' },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/risk-analysis/reports/reports.component').then((m) => m.RiskReportsPageComponent),
      },
      {
        path: 'heatmap',
        loadComponent: () =>
          import('./pages/risk-analysis/heatmap/heatmap.component').then((m) => m.RiskHeatmapPageComponent),
      },
    ],
  },
  {
    path: 'notifications',
    canActivate: [authGuard, roleGuard(ALL_AUTHENTICATED_ROLES)],
    loadComponent: () =>
      import('./components/layout/tharindu-shell/tharindu-main-layout.component').then(
        (m) => m.TharinduShellLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/notifications/notifications-page.component').then((m) => m.NotificationsPageComponent),
      },
    ],
  },
  {
    path: 'settings',
    canActivate: [authGuard, roleGuard(ALL_AUTHENTICATED_ROLES)],
    loadComponent: () =>
      import('./components/layout/tharindu-shell/tharindu-main-layout.component').then(
        (m) => m.TharinduShellLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/settings/settings.component').then((m) => m.SettingsPageComponent),
      },
    ],
  },
  {
    path: 'curriculum',
    canActivate: [authGuard, roleGuard(ADMIN_ROLES)],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'module-management' },
      {
        path: 'lecturer-assignment',
        loadComponent: () =>
          import('./pages/management/curriculum/curriculum-page.component').then((m) => m.CurriculumPageComponent),
      },
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
          import('./pages/curriculum/prerequisite-mapping/prerequisite-mapping').then(
            (m) => m.PrerequisiteMappingComponent
          ),
      },
      {
        // edit existing prerequisite - reuses prerequisite-mapping page in edit mode
        path: 'prerequisites/:id/edit',
        loadComponent: () =>
          import('./pages/curriculum/prerequisite-mapping/prerequisite-mapping').then(
            (m) => m.PrerequisiteMappingComponent
          ),
      },
      {
        path: 'prerequisite-management',
        loadComponent: () =>
          import('./pages/curriculum/prerequisite-management/prerequisite-management').then(
            (m) => m.PrerequisiteManagementComponent
          ),
      },
      {
        path: 'dependency-visualization',
        loadComponent: () =>
          import('./pages/curriculum/dependency-visualization/dependency-visualization').then(
            (m) => m.DependencyVisualizationComponent
          ),
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
  {
    path: 'readiness',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/readiness/readiness-redirect/readiness-redirect').then((m) => m.ReadinessRedirectComponent),
      },
      {
        path: 'overview',
        canActivate: [roleGuard(ADMIN_AND_LECTURER_ROLES)],
        loadComponent: () =>
          import('./components/layout/tharindu-shell/tharindu-main-layout.component').then(
            (m) => m.TharinduShellLayoutComponent
          ),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/readiness/overview/overview.component').then((m) => m.ReadinessOverviewPageComponent),
          },
        ],
      },
      {
        path: 'question-bank',
        canActivate: [roleGuard(ADMIN_AND_LECTURER_ROLES)],
        loadComponent: () =>
          import('./pages/readiness/question-bank/question-bank').then((m) => m.QuestionBankComponent),
      },
      {
        path: 'questions/new',
        canActivate: [roleGuard(ADMIN_AND_LECTURER_ROLES)],
        loadComponent: () =>
          import('./pages/readiness/question-bank/add-edit-question/add-edit-question').then(
            (m) => m.AddEditQuestionComponent
          ),
      },
      {
        path: 'questions/:id/edit',
        canActivate: [roleGuard(ADMIN_AND_LECTURER_ROLES)],
        loadComponent: () =>
          import('./pages/readiness/question-bank/add-edit-question/add-edit-question').then(
            (m) => m.AddEditQuestionComponent
          ),
      },
      {
        path: 'quiz-builder',
        canActivate: [roleGuard(ADMIN_AND_LECTURER_ROLES)],
        loadComponent: () =>
          import('./pages/readiness/quiz-builder/quiz-builder').then((m) => m.QuizBuilderComponent),
      },
      {
        // edit existing quiz - reuses the quiz-builder component in edit mode
        path: 'quizzes/:id/edit',
        canActivate: [roleGuard(ADMIN_AND_LECTURER_ROLES)],
        loadComponent: () =>
          import('./pages/readiness/quiz-builder/quiz-builder').then((m) => m.QuizBuilderComponent),
      },
      {
        path: 'quiz-scheduling',
        canActivate: [roleGuard(ADMIN_AND_LECTURER_ROLES)],
        loadComponent: () =>
          import('./pages/readiness/quiz-scheduling/quiz-scheduling').then((m) => m.QuizSchedulingComponent),
      },
      {
        path: 'quiz-attempt/:id',
        canActivate: [roleGuard(LECTURER_OR_STUDENT_ROLES)],
        loadComponent: () =>
          import('./pages/readiness/quiz-attempt/quiz-attempt').then((m) => m.QuizAttemptComponent),
      },
      {
        // submission detail page - view a specific quiz submission with answers
        path: 'submissions/:id',
        loadComponent: () =>
          import('./pages/readiness/submission-detail/submission-detail').then((m) => m.SubmissionDetailComponent),
      },
      {
        // resource library - browse learning materials
        path: 'resources',
        loadComponent: () =>
          import('./pages/readiness/resource-library/resource-library').then((m) => m.ResourceLibraryComponent),
      },
      {
        path: 'available-quizzes',
        canActivate: [roleGuard(STUDENT_ROLES)],
        loadComponent: () =>
          import('./pages/readiness/available-quizzes/available-quizzes').then((m) => m.AvailableQuizzesComponent),
      },
      {
        path: 'submission-tracking',
        canActivate: [roleGuard(ADMIN_AND_LECTURER_ROLES)],
        loadComponent: () =>
          import('./pages/readiness/submission-tracking/submission-tracking').then(
            (m) => m.SubmissionTrackingComponent
          ),
      },
      {
        path: 'attempt-history',
        canActivate: [roleGuard(ALL_AUTHENTICATED_ROLES)],
        loadComponent: () =>
          import('./pages/readiness/attempt-history/attempt-history').then((m) => m.AttemptHistoryComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];
