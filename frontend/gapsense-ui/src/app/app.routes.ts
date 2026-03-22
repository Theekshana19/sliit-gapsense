import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'risk-thresholds', pathMatch: 'full' },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./pages/auth/login/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'auth/signup/student',
    loadComponent: () =>
      import('./pages/auth/signup-student/signup-student-page.component').then((m) => m.SignupStudentPageComponent),
  },
  {
    path: 'auth/signup/lecturer',
    loadComponent: () =>
      import('./pages/auth/signup-lecturer/signup-lecturer-page.component').then((m) => m.SignupLecturerPageComponent),
  },
  {
    path: 'auth/signup/admin',
    loadComponent: () =>
      import('./pages/auth/signup-admin/signup-admin-page.component').then((m) => m.SignupAdminPageComponent),
  },
  {
    path: 'auth/signup',
    loadComponent: () =>
      import('./pages/auth/signup-role/signup-role-page.component').then((m) => m.SignupRolePageComponent),
  },
  {
    path: 'risk-thresholds',
    loadComponent: () =>
      import('./pages/risk-analysis/risk-threshold-management/risk-threshold-management.component').then(
        (m) => m.RiskThresholdManagementComponent
      ),
  },
  {
    path: 'recommendation-rules/add',
    loadComponent: () =>
      import('./pages/risk-analysis/add-recommendation-rule/add-recommendation-rule.component').then(
        (m) => m.AddRecommendationRuleComponent
      ),
  },
  {
    path: 'recommendation-rules/:id/edit',
    loadComponent: () =>
      import('./pages/risk-analysis/add-recommendation-rule/add-recommendation-rule.component').then(
        (m) => m.AddRecommendationRuleComponent
      ),
  },
  {
    path: 'recommendation-rules',
    loadComponent: () =>
      import('./pages/risk-analysis/recommendation-rule-management/recommendation-rule-management.component').then(
        (m) => m.RecommendationRuleManagementComponent
      ),
  },
  {
    path: 'readiness-results',
    loadComponent: () =>
      import('./pages/risk-analysis/readiness-result/readiness-result.component').then(
        (m) => m.ReadinessResultComponent
      ),
  },
  {
    path: 'weak-topic-analysis',
    loadComponent: () =>
      import('./pages/risk-analysis/weak-topic-analysis/weak-topic-analysis.component').then(
        (m) => m.WeakTopicAnalysisComponent
      ),
  },
  {
    path: 'recommendations',
    loadComponent: () =>
      import('./pages/risk-analysis/personalized-recommendations/personalized-recommendations.component').then(
        (m) => m.PersonalizedRecommendationsComponent
      ),
  },
  {
    path: 'student-profile',
    loadComponent: () =>
      import('./pages/risk-analysis/student-readiness-profile/student-readiness-profile.component').then(
        (m) => m.StudentReadinessProfileComponent
      ),
  },
  {
    path: 'learning-path',
    loadComponent: () =>
      import('./pages/risk-analysis/personalized-learning-path/personalized-learning-path.component').then(
        (m) => m.PersonalizedLearningPathComponent
      ),
  },
  {
    path: 'reassessment-comparison',
    loadComponent: () =>
      import('./pages/risk-analysis/reassessment-comparison/reassessment-comparison.component').then(
        (m) => m.ReassessmentComparisonComponent
      ),
  },
  {
    path: 'risk-trends',
    loadComponent: () =>
      import('./pages/risk-analysis/risk-trends-summary/risk-trends-summary.component').then(
        (m) => m.RiskTrendsSummaryComponent
      ),
  },
  { path: '**', redirectTo: 'risk-thresholds' },
];
