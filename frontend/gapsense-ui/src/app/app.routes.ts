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
  { path: '**', redirectTo: 'risk-thresholds' },
];
