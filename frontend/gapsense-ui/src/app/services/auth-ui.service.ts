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
import type { UpdateMyProfileRequest, UserProfile } from '../models/auth/user-profile.model';

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
  profile?: UserProfile;
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
  private static readonly TokenKey = 'gapSense.auth.token';

  readonly batchOptions: readonly AuthSelectOption[] = BATCH_OPTIONS;
  readonly degreeProgramOptions: readonly AuthSelectOption[] = DEGREE_OPTIONS;
  readonly departmentOptions: readonly AuthSelectOption[] = DEPARTMENT_OPTIONS;

  private readonly _flashMessage = signal<string | null>(null);
  readonly flashMessage = this._flashMessage.asReadonly();
  private readonly _currentUser = signal<UserProfile | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  constructor(
    private readonly router: Router,
    private readonly http: HttpClient
  ) {
    // Keep auth state when browser refreshes.
    if (this.hasToken()) {
      void this.loadMe();
    }
  }

  clearFlash(): void {
    this._flashMessage.set(null);
  }

  hasToken(): boolean {
    return !!this.getStoredToken();
  }

  logout(): void {
    localStorage.removeItem(AuthUiService.TokenKey);
    sessionStorage.removeItem(AuthUiService.TokenKey);
    this._currentUser.set(null);
    this._flashMessage.set('Signed out successfully.');
    void this.router.navigateByUrl('/auth/login');
  }

  /** Post-login landing: students → readiness; admin/lecturer → threshold management. */
  defaultHomeUrlForRole(role: AuthRole): string {
    switch (role) {
      case 'student':
        return '/readiness-results';
      case 'admin':
      case 'lecturer':
        return '/risk-thresholds';
    }
  }

  login(payload: LoginRequest): void {
    void this.loginAsync(payload);
  }

  signup(
    role: AuthRole,
    payload: StudentSignupPayload | LecturerSignupPayload | AdminSignupPayload
  ): void {
    void this.signupAsync(role, payload);
  }

  private async loginAsync(payload: LoginRequest): Promise<void> {
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
      this._currentUser.set(res.data.profile ?? null);
      if (!res.data.profile) {
        await this.loadMe();
      }

      const profile = this.currentUser();
      const role =
        profile?.role ?? this.parseAuthRoleFromLogin(res.data.role);
      const home =
        role !== null
          ? this.defaultHomeUrlForRole(role)
          : '/readiness-results';

      this._flashMessage.set('Signed in successfully. Redirecting…');
      window.setTimeout(() => {
        this._flashMessage.set(null);
        void this.router.navigateByUrl(home);
      }, 300);
    } catch (err) {
      const msg = this.extractApiError(err);
      this._flashMessage.set(msg || 'Login failed. Please try again.');
    }
  }

  private parseAuthRoleFromLogin(value: unknown): AuthRole | null {
    if (value === 'student' || value === 'lecturer' || value === 'admin') {
      return value;
    }
    return null;
  }

  private async signupAsync(
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
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(AuthUiService.TokenKey, token);
    // Ensure only one active token source at a time.
    if (rememberMe) {
      sessionStorage.removeItem(AuthUiService.TokenKey);
    } else {
      localStorage.removeItem(AuthUiService.TokenKey);
    }
  }

  getStoredToken(): string | null {
    return localStorage.getItem(AuthUiService.TokenKey) ??
      sessionStorage.getItem(AuthUiService.TokenKey);
  }

  async loadMe(): Promise<UserProfile | null> {
    if (!this.hasToken()) {
      this._currentUser.set(null);
      return null;
    }

    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<UserProfile>>(`${API_BASE_URL}/api/auth/me`)
      );
      if (!res.success || !res.data) {
        this._currentUser.set(null);
        return null;
      }

      this._currentUser.set(res.data);
      return res.data;
    } catch {
      // Token may be expired/invalid. Force re-login.
      localStorage.removeItem(AuthUiService.TokenKey);
      sessionStorage.removeItem(AuthUiService.TokenKey);
      this._currentUser.set(null);
      return null;
    }
  }

  async updateMyProfile(payload: UpdateMyProfileRequest): Promise<boolean> {
    this._flashMessage.set(null);
    try {
      const res = await firstValueFrom(
        this.http.put<ApiResponse<UserProfile>>(`${API_BASE_URL}/api/auth/me`, payload)
      );
      if (!res.success || !res.data) {
        this._flashMessage.set(res.message || 'Profile update failed.');
        return false;
      }
      this._currentUser.set(res.data);
      this._flashMessage.set('Profile updated successfully.');
      return true;
    } catch (err) {
      this._flashMessage.set(this.extractApiError(err) || 'Profile update failed.');
      return false;
    }
  }

  async uploadProfilePhoto(file: File): Promise<boolean> {
    this._flashMessage.set(null);
    const body = new FormData();
    body.append('file', file);
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<UserProfile>>(`${API_BASE_URL}/api/auth/me/photo`, body)
      );
      if (!res.success || !res.data) {
        this._flashMessage.set(res.message || 'Photo upload failed.');
        return false;
      }
      this._currentUser.set(res.data);
      this._flashMessage.set('Profile photo updated.');
      return true;
    } catch (err) {
      this._flashMessage.set(this.extractApiError(err) || 'Photo upload failed.');
      return false;
    }
  }

  async removeProfilePhoto(): Promise<boolean> {
    this._flashMessage.set(null);
    try {
      const res = await firstValueFrom(
        this.http.delete<ApiResponse<UserProfile>>(`${API_BASE_URL}/api/auth/me/photo`)
      );
      if (!res.success || !res.data) {
        this._flashMessage.set(res.message || 'Photo removal failed.');
        return false;
      }
      this._currentUser.set(res.data);
      this._flashMessage.set('Profile photo removed.');
      return true;
    } catch (err) {
      this._flashMessage.set(this.extractApiError(err) || 'Photo removal failed.');
      return false;
    }
  }

  private extractApiError(err: unknown): string | null {
    const e = err as HttpErrorResponse;
    const payload = e?.error as Partial<ApiResponse<unknown>> | undefined;
    if (payload?.message) return payload.message;
    if (typeof e?.message === 'string') return e.message;
    return null;
  }
}
