import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { HttpErrorResponse } from '@angular/common/http';
import type { AuthSelectOption } from '../models/auth/auth-select-option.model';
import type { AuthRole } from '../models/auth/auth-role.model';
import type { LoginRequest } from '../models/auth/login-request.model';
import type { StudentSignupPayload } from '../models/auth/student-signup.model';
import type { LecturerSignupPayload } from '../models/auth/lecturer-signup.model';
import type { AdminSignupPayload } from '../models/auth/admin-signup.model';
import { API_BASE_URL } from '../config/api.config';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface AuthResponseApi {
  token: string;
  expiresAt: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  profile?: unknown;
}

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

@Injectable({ providedIn: 'root' })
export class AuthUiService {
  readonly batchOptions: readonly AuthSelectOption[] = BATCH_OPTIONS;
  readonly degreeProgramOptions: readonly AuthSelectOption[] = DEGREE_OPTIONS;
  readonly departmentOptions: readonly AuthSelectOption[] = DEPARTMENT_OPTIONS;

  private readonly _flashMessage = signal<string | null>(null);
  readonly flashMessage = this._flashMessage.asReadonly();

  constructor(
    private readonly router: Router,
    private readonly http: HttpClient
  ) {}

  clearFlash(): void {
    this._flashMessage.set(null);
  }

  mockLogin(payload: LoginRequest): void {
    // Keep the public method name so your existing form components work.
    void this.login(payload);
  }

  mockSignup(
    role: AuthRole,
    payload: StudentSignupPayload | LecturerSignupPayload | AdminSignupPayload
  ): void {
    // Keep the public method name so your existing form components work.
    void this.signup(role, payload);
  }

  private async login(payload: LoginRequest): Promise<void> {
    this._flashMessage.set(null);
    const url = `${API_BASE_URL}/api/auth/login`;

    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<AuthResponseApi>>(url, {
          email: payload.email,
          password: payload.password,
          rememberMe: payload.rememberMe,
        })
      );

      if (!res.success || !res.data?.token) {
        this._flashMessage.set(res.message || 'Login failed.');
        return;
      }

      this.storeToken(res.data.token, payload.rememberMe);

      this._flashMessage.set('Signed in successfully. Redirecting…');
      window.setTimeout(() => {
        this._flashMessage.set(null);
        void this.router.navigateByUrl('/risk-thresholds');
      }, 300);
    } catch (err) {
      const msg = this.extractApiError(err);
      this._flashMessage.set(msg || 'Login failed. Please try again.');
    }
  }

  private async signup(
    role: AuthRole,
    payload: StudentSignupPayload | LecturerSignupPayload | AdminSignupPayload
  ): Promise<void> {
    this._flashMessage.set(null);
    const url = this.signupUrl(role);

    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<unknown>>(url, payload)
      );

      if (!res.success) {
        this._flashMessage.set(res.message || 'Signup failed.');
        return;
      }

      this._flashMessage.set('Registration complete. Redirecting to login…');
      window.setTimeout(() => {
        this._flashMessage.set(null);
        void this.router.navigateByUrl('/auth/login');
      }, 300);
    } catch (err) {
      const msg = this.extractApiError(err);
      this._flashMessage.set(msg || 'Signup failed. Please try again.');
    }
  }

  private signupUrl(role: AuthRole): string {
    switch (role) {
      case 'student':
        return `${API_BASE_URL}/api/auth/signup/student`;
      case 'lecturer':
        return `${API_BASE_URL}/api/auth/signup/lecturer`;
      case 'admin':
        return `${API_BASE_URL}/api/auth/signup/admin`;
    }
  }

  private storeToken(token: string, rememberMe: boolean): void {
    // Keep token handling simple for now; later you can add an interceptor.
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('gapSense.auth.token', token);
  }

  private extractApiError(err: unknown): string | null {
    const e = err as HttpErrorResponse;
    const payload = e?.error as Partial<ApiResponse<unknown>> | undefined;
    if (payload?.message) return payload.message;
    if (typeof e?.message === 'string') return e.message;
    return null;
  }
}
