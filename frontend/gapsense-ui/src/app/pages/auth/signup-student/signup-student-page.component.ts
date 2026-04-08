import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthShellComponent } from '../../../components/layout/auth-shell/auth-shell.component';
import { AuthHeroPanelComponent } from '../../../components/layout/auth-hero-panel/auth-hero-panel.component';
import { StudentSignupFormComponent } from '../../../components/auth/student-signup-form/student-signup-form.component';

@Component({
  selector: 'app-signup-student-page',
  standalone: true,
  imports: [AuthShellComponent, AuthHeroPanelComponent, StudentSignupFormComponent],
  templateUrl: './signup-student-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupStudentPageComponent {}
