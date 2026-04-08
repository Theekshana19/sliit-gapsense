import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthShellComponent } from '../../../components/layout/auth-shell/auth-shell.component';
import { AuthHeroPanelComponent } from '../../../components/layout/auth-hero-panel/auth-hero-panel.component';
import { AdminSignupFormComponent } from '../../../components/auth/admin-signup-form/admin-signup-form.component';

@Component({
  selector: 'app-signup-admin-page',
  standalone: true,
  imports: [AuthShellComponent, AuthHeroPanelComponent, AdminSignupFormComponent],
  templateUrl: './signup-admin-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupAdminPageComponent {}
