import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { TharinduShellSidebarComponent } from './tharindu-sidebar.component';
import { TharinduShellTopbarComponent } from './tharindu-topbar.component';

@Component({
  standalone: true,
  selector: 'app-tharindu-shell-layout',
  imports: [
    RouterOutlet,
    TharinduShellSidebarComponent,
    TharinduShellTopbarComponent,
    BreadcrumbComponent,
  ],
  template: `
    <div class="min-h-screen bg-[#f8fafc] font-body text-on-surface antialiased">
      <app-tharindu-shell-topbar />
      <app-tharindu-shell-sidebar />
      <div class="pt-16 lg:pl-64">
        <main class="h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden px-6 py-8 sm:px-10">
          <app-breadcrumb />
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class TharinduShellLayoutComponent {}
