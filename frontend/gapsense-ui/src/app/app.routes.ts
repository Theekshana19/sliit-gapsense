import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { roleGuard } from './guards/role.guard';
import {
  ADMIN_ROLES,
  LECTURER_OR_STUDENT_ROLES,
  STAFF_DASHBOARD_ROLES,
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
    canActivate: [authGuard, roleGuard(STAFF_DASHBOARD_ROLES)],
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
    canActivate: [authGuard, roleGuard(STUDENT_ROLES)],
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
  {
    path: 'curriculum',
    canActivate: [authGuard, roleGuard(ADMIN_ROLES)],
    loadComponent: () =>
      import('./pages/management/curriculum/curriculum-page.component').then((m) => m.CurriculumPageComponent),
  },
  { path: '**', redirectTo: 'auth/login' },
];
