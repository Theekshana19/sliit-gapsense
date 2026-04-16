import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  DashboardFullDto,
  DashboardReadinessTrendDto,
  DashboardRiskDistributionDto,
  DashboardSummaryDto,
  SemesterDto,
} from '../models/dashboard/academic-dashboard.model';

@Injectable({ providedIn: 'root' })
export class AcademicDashboardService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  listSemesters(): Observable<SemesterDto[]> {
    return this.http.get<SemesterDto[]>(`${this.base}/semesters`).pipe(catchError(this.pipeError));
  }

  /** Returns null when API responds 404 (no current semester configured). */
  getCurrentSemester(): Observable<SemesterDto | null> {
    return this.http.get<SemesterDto>(`${this.base}/semesters/current`).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          return of(null);
        }
        return this.pipeError(err);
      }),
    );
  }

  getSummary(semesterId: string): Observable<DashboardSummaryDto> {
    return this.http
      .get<DashboardSummaryDto>(`${this.base}/dashboard/summary`, { params: { semesterId } })
      .pipe(catchError(this.pipeError));
  }

  getReadinessTrend(semesterId: string): Observable<DashboardReadinessTrendDto> {
    return this.http
      .get<DashboardReadinessTrendDto>(`${this.base}/dashboard/readiness-trend`, { params: { semesterId } })
      .pipe(catchError(this.pipeError));
  }

  getRiskDistribution(semesterId: string): Observable<DashboardRiskDistributionDto> {
    return this.http
      .get<DashboardRiskDistributionDto>(`${this.base}/dashboard/risk-distribution`, { params: { semesterId } })
      .pipe(catchError(this.pipeError));
  }

  getFull(semesterId: string): Observable<DashboardFullDto> {
    return this.http
      .get<DashboardFullDto>(`${this.base}/dashboard/full`, { params: { semesterId } })
      .pipe(catchError(this.pipeError));
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
