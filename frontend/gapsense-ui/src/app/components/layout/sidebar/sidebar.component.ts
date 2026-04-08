import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthUiService } from '../../../services/auth-ui.service';
import type { AuthRole } from '../../../models/auth/auth-role.model';
import { sidebarItemsForRole } from '../../../config/navigation.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  readonly activeItem = input<string>('');

  private readonly authUi = inject(AuthUiService);

  protected readonly role = computed<AuthRole | null>(() => this.authUi.currentUser()?.role ?? null);

  protected readonly navItems = computed(() => sidebarItemsForRole(this.role()));

  logout(): void {
    this.authUi.logout();
  }
}
