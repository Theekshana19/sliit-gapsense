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
    const extracted = this.extractApiMessage(err);
    if (extracted) {
      return throwError(() => new Error(extracted));
    }
    return throwError(() => new Error(err.message || 'Request failed.'));
  }

  /** Parses API JSON (`message`), ProblemDetails (`detail` / `title`), or string bodies so the UI is not stuck on generic HttpClient text. */
  private extractApiMessage(err: HttpErrorResponse): string | null {
    const body = err.error;
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      const o = body as Record<string, unknown>;
      for (const key of ['message', 'detail', 'title'] as const) {
        const v = o[key];
        if (typeof v === 'string' && v.trim()) {
          return v.trim();
        }
      }
    }
    if (typeof body === 'string') {
      const t = body.trim();
      if (t.startsWith('{')) {
        try {
          const parsed = JSON.parse(t) as Record<string, unknown>;
          for (const key of ['message', 'detail', 'title'] as const) {
            const v = parsed[key];
            if (typeof v === 'string' && v.trim()) {
              return v.trim();
            }
          }
        } catch {
          /* ignore */
        }
      }
      if (t.length > 0 && t.length < 800) {
        return t;
      }
    }
    if (err.status === 0) {
      return 'Cannot reach the API. Start the backend (npm run start:api from gapsense-ui) and ensure it listens on http://localhost:5120.';
    }
    if (err.status === 502 || err.status === 504) {
      return 'Backend unreachable from the dev proxy. Start the API on http://localhost:5120 (npm run start:api from gapsense-ui).';
    }
    if (err.status === 500) {
      return 'Server error (HTTP 500). Check the API terminal log and SQL Server: ConnectionStrings:DefaultConnection in appsettings.json; run dotnet ef database update if tables are missing.';
    }
    return null;
  }
}
