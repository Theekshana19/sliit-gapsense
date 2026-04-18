import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopBarComponent } from '../top-bar/top-bar.component';

/**
 * Layout for monitoring, risk-analysis, notifications, and settings.
 * Uses the same top bar + role sidebar as dashboard and MemberShell so admins/lecturers
 * do not see a second, minimal menu when switching between curriculum and Tharindu routes.
 */
@Component({
  standalone: true,
  selector: 'app-tharindu-shell-layout',
  imports: [RouterOutlet, TopBarComponent, SidebarComponent, BreadcrumbComponent],
  template: `
    <app-top-bar />
    <app-sidebar />
    <main
      class="ml-64 min-h-screen overflow-x-hidden bg-slate-50/50 pb-12 pl-6 pr-6 pt-20 font-body text-slate-900 antialiased sm:pl-8 sm:pr-8"
    >
      <app-breadcrumb />
      <router-outlet />
    </main>
  `,
})
export class TharinduShellLayoutComponent {}
