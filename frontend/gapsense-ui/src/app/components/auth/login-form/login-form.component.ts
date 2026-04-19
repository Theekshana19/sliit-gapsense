import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, merge, startWith } from 'rxjs';
import { AuthUiService } from '../../../services/auth-ui.service';
import { AuthInputComponent } from '../../ui/auth-input/auth-input.component';
import { AuthPasswordInputComponent } from '../../ui/auth-password-input/auth-password-input.component';
import { AuthButtonComponent } from '../../ui/auth-button/auth-button.component';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthInputComponent,
    AuthPasswordInputComponent,
    AuthButtonComponent,
  ],
  templateUrl: './login-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authUi = inject(AuthUiService);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false],
  });

  protected readonly canSubmit = toSignal(
    merge(this.form.statusChanges, this.form.valueChanges).pipe(
      startWith(null),
      map(() => this.form.valid),
    ),
    { initialValue: this.form.valid },
  );

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.authUi.login({
      email: v.email,
      password: v.password,
      rememberMe: v.rememberMe,
    });
  }
}
