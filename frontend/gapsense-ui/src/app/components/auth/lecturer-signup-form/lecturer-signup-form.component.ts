import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { AuthUiService } from '../../../services/auth-ui.service';
import { passwordsMatchValidator } from '../../../utils/auth-validators.util';
import {
  computePasswordStrengthSegments,
  passwordStrengthLabel,
} from '../../../utils/auth-password-strength.util';
import { AuthInputComponent } from '../../ui/auth-input/auth-input.component';
import { AuthPasswordInputComponent } from '../../ui/auth-password-input/auth-password-input.component';
import { AuthSelectComponent } from '../../ui/auth-select/auth-select.component';
import { AuthButtonComponent } from '../../ui/auth-button/auth-button.component';
import { AuthStepBadgeComponent } from '../../ui/auth-step-badge/auth-step-badge.component';
import { PasswordStrengthBarComponent } from '../../ui/password-strength-bar/password-strength-bar.component';

@Component({
  selector: 'app-lecturer-signup-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthInputComponent,
    AuthPasswordInputComponent,
    AuthSelectComponent,
    AuthButtonComponent,
    AuthStepBadgeComponent,
    PasswordStrengthBarComponent,
  ],
  templateUrl: './lecturer-signup-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecturerSignupFormComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly authUi = inject(AuthUiService);

  protected readonly form = this.fb.group(
    {
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      staffId: ['', Validators.required],
      department: ['', Validators.required],
      specialization: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator }
  );

  protected readonly strengthSegments = toSignal(
    this.form.controls.password.valueChanges.pipe(
      startWith(''),
      map((v) => computePasswordStrengthSegments(v ?? ''))
    ),
    { initialValue: 0 }
  );

  protected strengthLabel(): string {
    return passwordStrengthLabel(this.strengthSegments());
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.authUi.mockSignup('lecturer', {
      fullName: v.fullName ?? '',
      email: v.email ?? '',
      staffId: v.staffId ?? '',
      department: v.department ?? '',
      specialization: v.specialization ?? '',
      password: v.password ?? '',
      confirmPassword: v.confirmPassword ?? '',
    });
  }

  protected passwordMismatch(): boolean {
    const touched = this.form.touched || this.form.controls.confirmPassword.touched;
    return touched && this.form.hasError('passwordMismatch');
  }
}
