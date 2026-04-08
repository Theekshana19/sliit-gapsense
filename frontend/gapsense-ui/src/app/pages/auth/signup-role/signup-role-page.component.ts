import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthShellComponent } from '../../../components/layout/auth-shell/auth-shell.component';
import { AuthHeroPanelComponent } from '../../../components/layout/auth-hero-panel/auth-hero-panel.component';
import { SignupRoleSelectorComponent } from '../../../components/auth/signup-role-selector/signup-role-selector.component';

@Component({
  selector: 'app-signup-role-page',
  standalone: true,
  imports: [AuthShellComponent, AuthHeroPanelComponent, SignupRoleSelectorComponent, RouterLink],
  templateUrl: './signup-role-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupRolePageComponent {}
