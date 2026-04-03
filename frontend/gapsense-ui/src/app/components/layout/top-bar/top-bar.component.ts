import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthUiService } from '../../../services/auth-ui.service';
import { MANAGEMENT_ROLES } from '../../../models/auth/auth-role.model';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css',
})
export class TopBarComponent {
  readonly activeMainNav = input<string>('analysis');

  private readonly router = inject(Router);
  protected readonly authUi = inject(AuthUiService);
  protected menuOpen = false;

  protected readonly canManage = computed(() => {
    const role = this.authUi.currentUser()?.role;
    return role != null && MANAGEMENT_ROLES.includes(role);
  });

  constructor() {
    if (this.authUi.hasToken()) {
      void this.authUi.loadMe();
    }
  }

  protected isAnalysisRoute(): boolean {
    const path = this.router.url.split('?')[0] ?? '';
    if (this.canManage()) {
      return path.startsWith('/risk-thresholds') || path.startsWith('/recommendation-rules');
    }
    return (
      path.startsWith('/weak-topic-analysis') ||
      path.startsWith('/readiness-results') ||
      path.startsWith('/recommendations') ||
      path.startsWith('/student-profile') ||
      path.startsWith('/learning-path') ||
      path.startsWith('/reassessment-comparison')
    );
  }

  protected toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  protected closeMenu(): void {
    this.menuOpen = false;
  }

  protected profileImageUrl(): string | null {
    const path = this.authUi.currentUser()?.profileImagePath;
    if (!path) return null;
    return path.startsWith('http') ? path : `https://localhost:7277${path}`;
  }

  protected logout(): void {
    this.closeMenu();
    this.authUi.logout();
  }
}
