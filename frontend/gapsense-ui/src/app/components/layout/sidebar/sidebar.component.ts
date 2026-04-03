import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthUiService } from '../../../services/auth-ui.service';
import { MANAGEMENT_ROLES } from '../../../models/auth/auth-role.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  readonly activeItem = input<string>('risk-thresholds');
  private readonly authUi = inject(AuthUiService);

  /** Lecturers and admins see configuration screens; students do not. */
  protected readonly canManage = computed(() => {
    const role = this.authUi.currentUser()?.role;
    return role != null && MANAGEMENT_ROLES.includes(role);
  });
}
