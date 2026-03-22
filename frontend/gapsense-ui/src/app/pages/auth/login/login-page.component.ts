import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthShellComponent } from '../../../components/layout/auth-shell/auth-shell.component';
import { LoginFormComponent } from '../../../components/auth/login-form/login-form.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [AuthShellComponent, LoginFormComponent],
  templateUrl: './login-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {}
