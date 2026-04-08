import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthShellComponent } from '../../../components/layout/auth-shell/auth-shell.component';
import { AuthHeroPanelComponent } from '../../../components/layout/auth-hero-panel/auth-hero-panel.component';
import { LecturerSignupFormComponent } from '../../../components/auth/lecturer-signup-form/lecturer-signup-form.component';

@Component({
  selector: 'app-signup-lecturer-page',
  standalone: true,
  imports: [AuthShellComponent, AuthHeroPanelComponent, LecturerSignupFormComponent],
  templateUrl: './signup-lecturer-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupLecturerPageComponent {}
