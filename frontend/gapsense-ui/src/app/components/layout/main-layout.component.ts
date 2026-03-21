import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogComponent } from '../ui/confirm-dialog/confirm-dialog.component';
import { ToastContainerComponent } from '../ui/toast/toast-container.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './top-bar/topbar.component';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    SidebarComponent,
    TopbarComponent,
    BreadcrumbComponent,
    ToastContainerComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <div class="min-h-screen bg-[#f8fafc] font-body text-on-surface antialiased">
      <app-topbar />
      <app-sidebar />
      <div class="pt-16 lg:pl-64">
        <main class="h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden px-6 py-8 sm:px-10">
          <app-breadcrumb />
          <router-outlet />
        </main>
      </div>
      <app-toast-container />
      <app-confirm-dialog />
    </div>
  `,
})
export class MainLayoutComponent {}
