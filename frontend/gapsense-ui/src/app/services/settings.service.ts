import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  AcademicSettings,
  LecturerAcademicOptions,
  LecturerSettingsBundleDto,
  NotificationSettings,
  ProfileSettings,
  SecuritySettings,
} from '../models/settings/settings.model';

export interface LecturerSettingsSnapshot {
  profile: ProfileSettings;
  academic: AcademicSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/settings`;

  getBundle(): Observable<LecturerSettingsSnapshot> {
    return this.http.get<LecturerSettingsBundleDto>(`${this.base}/bundle`).pipe(
      map((dto) => ({
        profile: dto.profile,
        academic: dto.academic,
        notifications: dto.notifications,
        security: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          twoFactorEnabled: dto.security.twoFactorEnabled,
        },
      })),
      catchError(this.pipeError)
    );
  }

  getProfile(): Observable<ProfileSettings> {
    return this.http.get<ProfileSettings>(`${this.base}/profile`).pipe(catchError(this.pipeError));
  }

  updateProfile(profile: ProfileSettings): Observable<ProfileSettings> {
    return this.http.put<ProfileSettings>(`${this.base}/profile`, profile).pipe(catchError(this.pipeError));
  }

  getAcademic(): Observable<AcademicSettings> {
    return this.http.get<AcademicSettings>(`${this.base}/academic`).pipe(catchError(this.pipeError));
  }

  getAcademicOptions(): Observable<LecturerAcademicOptions> {
    return this.getBundle().pipe(
      map((bundle) => {
        const year = bundle.academic.academicYear;
        const fallbackYear = `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;
        return {
          semesterOptions: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'],
          yearOptions: [year || fallbackYear, fallbackYear, '2024/2025', '2025/2026', '2026/2027'].filter(
            (v, i, arr) => !!v && arr.indexOf(v) === i
          ),
        };
      })
    );
  }

  updateAcademic(academic: AcademicSettings): Observable<AcademicSettings> {
    return this.http.put<AcademicSettings>(`${this.base}/academic`, academic).pipe(catchError(this.pipeError));
  }

  getNotifications(): Observable<NotificationSettings> {
    return this.http.get<NotificationSettings>(`${this.base}/notifications`).pipe(catchError(this.pipeError));
  }

  updateNotifications(notifications: NotificationSettings): Observable<NotificationSettings> {
    return this.http.put<NotificationSettings>(`${this.base}/notifications`, notifications).pipe(catchError(this.pipeError));
  }

  getSecurity(): Observable<Omit<SecuritySettings, 'currentPassword' | 'newPassword' | 'confirmPassword'>> {
    return this.http
      .get<{ twoFactorEnabled: boolean; loginAlertEnabled: boolean; sessionTimeoutMinutes: number }>(`${this.base}/security`)
      .pipe(
        map((x) => ({ twoFactorEnabled: x.twoFactorEnabled })),
        catchError(this.pipeError)
      );
  }

  updateSecurity(security: SecuritySettings): Observable<{ twoFactorEnabled: boolean }> {
    return this.http
      .put<{ twoFactorEnabled: boolean }>(`${this.base}/security`, {
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
        confirmPassword: security.confirmPassword,
        twoFactorEnabled: security.twoFactorEnabled,
      })
      .pipe(catchError(this.pipeError));
  }

  logoutAllDevices(): Observable<void> {
    return this.http.post<void>(`${this.base}/security/logout-all-devices`, {}).pipe(catchError(this.pipeError));
  }

  private pipeError(err: HttpErrorResponse) {
    const body = err.error;
    if (body && typeof body === 'object') {
      const o = body as Record<string, unknown>;
      const msg = o['message'];
      if (typeof msg === 'string' && msg.trim()) {
        return throwError(() => new Error(msg));
      }
    }
    return throwError(() => new Error(err.message || 'Request failed.'));
  }
}
