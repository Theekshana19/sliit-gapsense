import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MemberShellComponent } from '../../components/layout/member-shell/member-shell.component';

/**
 * Structure-phase placeholder: route is registered and reachable; API wiring can follow.
 */
@Component({
  standalone: true,
  selector: 'app-backend-pending-page',
  imports: [MemberShellComponent],
  template: `
    <app-member-shell>
      <div class="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-8 text-amber-950 shadow-sm">
        <h1 class="text-xl font-bold">{{ title }}</h1>
        <p class="mt-3 text-sm font-medium">Backend integration pending</p>
        <p class="mt-2 text-sm text-amber-900/90">
          This screen is wired into navigation. Connect or adjust APIs in a later integration phase.
        </p>
      </div>
    </app-member-shell>
  `,
})
export class BackendPendingPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly title = (this.route.snapshot.data['title'] as string) || 'Page';
}
