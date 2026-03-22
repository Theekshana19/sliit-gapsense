import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'risk-thresholds', pathMatch: 'full' },
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
  { path: '**', redirectTo: 'risk-thresholds' },
];
