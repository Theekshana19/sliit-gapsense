import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthUiService } from '../../../services/auth-ui.service';
import type { AuthRole } from '../../../models/auth/auth-role.model';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css',
})
export class TopBarComponent {
  protected readonly authUi = inject(AuthUiService);
  protected menuOpen = false;

  protected readonly role = computed<AuthRole | null>(() => this.authUi.currentUser()?.role ?? null);

  /** Short label for the header so staff/students see which role is active after login. */
  protected readonly roleLabel = computed(() => {
    switch (this.role()) {
      case 'admin':
        return 'Admin';
      case 'lecturer':
        return 'Lecturer';
      case 'student':
        return 'Student';
      default:
        return '';
    }
  });

  constructor() {
    if (this.authUi.hasToken()) {
      void this.authUi.loadMe();
    }
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
