import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { AuthSelectOption } from '../models/auth/auth-select-option.model';
import type { AuthRole } from '../models/auth/auth-role.model';
import type { LoginRequest } from '../models/auth/login-request.model';
import type { StudentSignupPayload } from '../models/auth/student-signup.model';
import type { LecturerSignupPayload } from '../models/auth/lecturer-signup.model';
import type { AdminSignupPayload } from '../models/auth/admin-signup.model';

const BATCH_OPTIONS: AuthSelectOption[] = [
  { id: '2021', label: '2021 Intake' },
  { id: '2022', label: '2022 Intake' },
  { id: '2023', label: '2023 Intake' },
  { id: '2024', label: '2024 Intake' },
];

const DEGREE_OPTIONS: AuthSelectOption[] = [
  { id: 'bit', label: 'BSc (Hons) in Information Technology' },
  { id: 'bse', label: 'BSc (Hons) in Software Engineering' },
  { id: 'cs', label: 'BSc (Hons) in Computer Science' },
];

const DEPARTMENT_OPTIONS: AuthSelectOption[] = [
  { id: 'cse', label: 'Computer Science & Software Engineering' },
  { id: 'it', label: 'Information Technology' },
  { id: 'cyber', label: 'Cyber Security' },
];

/**
 * Frontend-only auth UI state and mock submit handlers.
 * Replace with HttpClient + real endpoints when backend is ready.
 */
@Injectable({ providedIn: 'root' })
export class AuthUiService {
  readonly batchOptions: readonly AuthSelectOption[] = BATCH_OPTIONS;
  readonly degreeProgramOptions: readonly AuthSelectOption[] = DEGREE_OPTIONS;
  readonly departmentOptions: readonly AuthSelectOption[] = DEPARTMENT_OPTIONS;

  private readonly _flashMessage = signal<string | null>(null);
  readonly flashMessage = this._flashMessage.asReadonly();

  constructor(private readonly router: Router) {}

  clearFlash(): void {
    this._flashMessage.set(null);
  }

  mockLogin(payload: LoginRequest): void {
    console.info('[AuthUiService] mock login', { email: payload.email, rememberMe: payload.rememberMe });
    this._flashMessage.set('Signed in successfully (demo). Redirecting…');
    window.setTimeout(() => {
      this._flashMessage.set(null);
      void this.router.navigateByUrl('/risk-thresholds');
    }, 1200);
  }

  mockSignup(role: AuthRole, payload: StudentSignupPayload | LecturerSignupPayload | AdminSignupPayload): void {
    console.info('[AuthUiService] mock signup', role, payload);
    this._flashMessage.set('Registration complete (demo). Redirecting to login…');
    window.setTimeout(() => {
      this._flashMessage.set(null);
      void this.router.navigateByUrl('/auth/login');
    }, 1200);
  }
}
