import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/layout/main-layout.component';
import { authChildGuard, authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { LoginPageComponent } from './pages/auth/login/login.component';
import { RegisterPageComponent } from './pages/auth/register/register.component';
import { DashboardPageComponent } from './pages/dashboard/dashboard/dashboard.component';
import { CurriculumAddPageComponent } from './pages/curriculum/add/add.component';
import { CurriculumListPageComponent } from './pages/curriculum/list/list.component';
import { InterventionPlanPageComponent } from './pages/monitoring/intervention-plan/intervention-plan.component';
import { MonitoringPlansPageComponent } from './pages/monitoring/plans/plans.component';
import { FollowUpsPageComponent } from './pages/monitoring/follow-ups/follow-ups.component';
import { ReadinessOverviewPageComponent } from './pages/readiness/overview/overview.component';
import { RiskHeatmapPageComponent } from './pages/risk-analysis/heatmap/heatmap.component';
import { RiskReportsPageComponent } from './pages/risk-analysis/reports/reports.component';

export const appRoutes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      { path: 'login', component: LoginPageComponent },
      { path: 'register', component: RegisterPageComponent },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'curriculum', component: CurriculumListPageComponent },
      { path: 'curriculum/add', component: CurriculumAddPageComponent },
      { path: 'readiness', pathMatch: 'full', redirectTo: 'readiness/overview' },
      { path: 'readiness/overview', component: ReadinessOverviewPageComponent },
      { path: 'risk-analysis', pathMatch: 'full', redirectTo: 'risk-analysis/reports' },
      { path: 'risk-analysis/reports', component: RiskReportsPageComponent },
      { path: 'risk-analysis/heatmap', component: RiskHeatmapPageComponent },
      { path: 'monitoring', pathMatch: 'full', redirectTo: 'monitoring/plans' },
      { path: 'monitoring/intervention-plan', component: InterventionPlanPageComponent },
      { path: 'monitoring/plans', component: MonitoringPlansPageComponent },
      { path: 'monitoring/follow-ups', component: FollowUpsPageComponent },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
