import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  GenerateReportPayload,
  GenerateReportResponseDto,
  ReportHistoryItemDto,
  ReportsOptionsDto,
  ReportsStatsDto,
} from '../models/risk-analysis/reports-export.model';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/reports`;

  getOptions(semesterId?: string): Observable<ReportsOptionsDto> {
    let params = new HttpParams();
    if (semesterId) {
      params = params.set('semesterId', semesterId);
    }
    return this.http.get<ReportsOptionsDto>(`${this.base}/options`, { params }).pipe(catchError(this.pipeError));
  }

  generate(body: GenerateReportPayload): Observable<GenerateReportResponseDto> {
    return this.http.post<GenerateReportResponseDto>(`${this.base}/generate`, body).pipe(catchError(this.pipeError));
  }

  getRecent(take = 10): Observable<ReportHistoryItemDto[]> {
    return this.http.get<ReportHistoryItemDto[]>(`${this.base}/recent`, { params: { take } }).pipe(catchError(this.pipeError));
  }

  getStats(): Observable<ReportsStatsDto> {
    return this.http.get<ReportsStatsDto>(`${this.base}/stats`).pipe(catchError(this.pipeError));
  }

  download(reportId: string): Observable<Blob> {
    return this.http
      .get(`${this.base}/${reportId}/download`, { responseType: 'blob' })
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
