import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  CreateInterventionPlanPayload,
  InterventionPlanTableRowDto,
  InterventionPlanningDashboardDto,
} from '../models/intervention-planning/intervention-planning.model';

@Injectable({ providedIn: 'root' })
export class InterventionPlanningService {
  private readonly http = inject(HttpClient);
  private readonly plansBase = `${environment.apiBaseUrl}/interventionplans`;
  private readonly analyticsBase = `${environment.apiBaseUrl}/interventionanalytics`;

  listPlans(): Observable<InterventionPlanTableRowDto[]> {
    return this.http.get<InterventionPlanTableRowDto[]>(this.plansBase).pipe(catchError(this.pipeError));
  }

  getDashboard(): Observable<InterventionPlanningDashboardDto> {
    return this.http.get<InterventionPlanningDashboardDto>(`${this.analyticsBase}/dashboard`).pipe(catchError(this.pipeError));
  }

  createPlan(body: CreateInterventionPlanPayload): Observable<InterventionPlanTableRowDto> {
    return this.http.post<InterventionPlanTableRowDto>(this.plansBase, body).pipe(catchError(this.pipeError));
  }

  deletePlan(id: string): Observable<void> {
    return this.http.delete<void>(`${this.plansBase}/${id}`).pipe(catchError(this.pipeError));
  }

  private pipeError(err: HttpErrorResponse) {
    const body = err.error;
    if (body && typeof body === 'object') {
      const o = body as Record<string, unknown>;
      const msg = o['message'];
      if (typeof msg === 'string' && msg.trim()) {
        return throwError(() => new Error(msg));
      }
      const errors = o['errors'];
      if (errors && typeof errors === 'object') {
        const flat = Object.values(errors as Record<string, unknown>)
          .flatMap((v) => (Array.isArray(v) ? v : [v]))
          .filter((x): x is string => typeof x === 'string');
        if (flat.length) {
          return throwError(() => new Error(flat.join(' ')));
        }
      }
    }
    return throwError(() => new Error(err.message || 'Request failed.'));
  }
}
