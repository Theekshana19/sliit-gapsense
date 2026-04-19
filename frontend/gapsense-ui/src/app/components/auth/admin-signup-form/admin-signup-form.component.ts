import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, merge, startWith } from 'rxjs';
import { AuthUiService } from '../../../services/auth-ui.service';
import { passwordsMatchValidator } from '../../../utils/auth-validators.util';
import {
  computePasswordStrengthSegments,
  passwordStrengthLabel,
} from '../../../utils/auth-password-strength.util';
import { AuthInputComponent } from '../../ui/auth-input/auth-input.component';
import { AuthPasswordInputComponent } from '../../ui/auth-password-input/auth-password-input.component';
import { AuthButtonComponent } from '../../ui/auth-button/auth-button.component';
import { PasswordStrengthBarComponent } from '../../ui/password-strength-bar/password-strength-bar.component';

@Component({
  selector: 'app-admin-signup-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthInputComponent,
    AuthPasswordInputComponent,
    AuthButtonComponent,
    PasswordStrengthBarComponent,
  ],
  templateUrl: './admin-signup-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSignupFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authUiSvc = inject(AuthUiService);

  protected readonly form = this.fb.group(
    {
      fullName: ['', Validators.required],
      institutionalEmail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      adminCode: ['', Validators.required],
    },
    { validators: passwordsMatchValidator }
  );

  protected readonly canSubmit = toSignal(
    merge(this.form.statusChanges, this.form.valueChanges).pipe(
      startWith(null),
      map(() => this.form.valid),
    ),
    { initialValue: this.form.valid },
  );

  protected readonly strengthSegments = toSignal(
    this.form.controls.password.valueChanges.pipe(
      startWith(''),
      map((v) => computePasswordStrengthSegments(v ?? ''))
    ),
    { initialValue: 0 }
  );

  protected strengthLabel(): string {
    return passwordStrengthLabel(this.strengthSegments()).toUpperCase();
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.authUiSvc.signup('admin', {
      fullName: v.fullName ?? '',
      institutionalEmail: v.institutionalEmail ?? '',
      password: v.password ?? '',
      confirmPassword: v.confirmPassword ?? '',
      adminCode: v.adminCode ?? '',
    });
  }

  protected passwordMismatch(): boolean {
    const touched = this.form.touched || this.form.controls.confirmPassword.touched;
    return touched && this.form.hasError('passwordMismatch');
  }
}
