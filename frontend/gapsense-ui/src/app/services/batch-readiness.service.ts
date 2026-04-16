import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  BatchReadinessExportData,
  BatchReadinessFilterOptions,
  BatchReadinessFilterPayload,
  BatchReadinessLedgerPage,
  BatchReadinessSummary,
} from '../models/batch-readiness/batch-readiness.model';

@Injectable({ providedIn: 'root' })
export class BatchReadinessService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/batch-readiness`;

  getFilterOptions(semesterId?: string | null): Observable<BatchReadinessFilterOptions> {
    let params = new HttpParams();
    if (semesterId) {
      params = params.set('semesterId', semesterId);
    }
    return this.http.get<BatchReadinessFilterOptions>(`${this.base}/filter-options`, { params }).pipe(catchError(this.pipeError));
  }

  getOverview(body: BatchReadinessFilterPayload): Observable<BatchReadinessSummary> {
    return this.http.post<BatchReadinessSummary>(`${this.base}/overview`, body).pipe(catchError(this.pipeError));
  }

  getLedgerPage(
    body: BatchReadinessFilterPayload & { page: number; pageSize: number },
  ): Observable<BatchReadinessLedgerPage> {
    return this.http.post<BatchReadinessLedgerPage>(`${this.base}/ledger`, body).pipe(catchError(this.pipeError));
  }

  getExportData(body: BatchReadinessFilterPayload): Observable<BatchReadinessExportData> {
    return this.http.post<BatchReadinessExportData>(`${this.base}/export-data`, body).pipe(catchError(this.pipeError));
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
