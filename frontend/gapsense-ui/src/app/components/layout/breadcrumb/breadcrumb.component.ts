import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

const PAGE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/readiness/overview': 'Batch Readiness Overview',
  '/risk-analysis/heatmap': 'High-Risk Monitoring',
  '/risk-analysis/reports': 'Reports & Export',
  '/curriculum': 'Curriculum',
  '/curriculum/add': 'Add Curriculum',
  '/monitoring/plans': 'Interventions',
  '/monitoring/follow-ups': 'Follow-ups',
  '/monitoring/intervention-plan': 'Intervention Plan',
};

@Component({
  standalone: true,
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  template: `
    <nav class="mb-6 text-sm" aria-label="Breadcrumb">
      <ol class="flex flex-wrap items-center gap-2">
        <li>
          <a routerLink="/dashboard" class="text-slate-500 transition-colors hover:text-[#003f87]">Academic Portal</a>
        </li>
        <li><span class="text-slate-300" aria-hidden="true">›</span></li>
        <li class="font-semibold text-[#003f87]">{{ currentLabel }}</li>
      </ol>
    </nav>
  `,
})
export class BreadcrumbComponent {
  private readonly router = inject(Router);

  get currentLabel(): string {
    let path = this.router.url.split('?')[0];
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    if (path === '' || path === '/') {
      path = '/dashboard';
    }
    return PAGE_LABELS[path] ?? 'Page';
  }
}
