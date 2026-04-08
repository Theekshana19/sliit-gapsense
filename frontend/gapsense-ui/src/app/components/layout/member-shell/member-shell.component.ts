import { Component } from '@angular/core';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

/**
 * Shell for Sewwandi curriculum/readiness pages: uses integration role-based top bar + sidebar.
 * Replaces Sewwandi MainLayoutComponent (which used a different sidebar/top-bar).
 */
@Component({
  selector: 'app-member-shell',
  standalone: true,
  imports: [TopBarComponent, SidebarComponent],
  template: `
    <app-top-bar />
    <app-sidebar />
    <main class="ml-64 min-h-0 bg-slate-50/50 pb-12 pl-6 pr-6 pt-20 sm:pl-8 sm:pr-8">
      <ng-content />
    </main>
  `,
})
export class MemberShellComponent {}
