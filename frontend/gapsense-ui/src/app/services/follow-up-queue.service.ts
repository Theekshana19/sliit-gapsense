import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import type { FollowUpManagementDto, FollowUpTaskDto } from '../models/follow-up-queue.model';

@Injectable({ providedIn: 'root' })
export class FollowUpQueueService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  getManagement(semesterId: string, search?: string, module?: string, status?: string): Observable<FollowUpManagementDto> {
    let params = new HttpParams().set('semesterId', semesterId);
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }
    if (module?.trim()) {
      params = params.set('module', module.trim());
    }
    if (status?.trim() && status !== 'all') {
      params = params.set('status', status.trim());
    }

    return this.http.get<FollowUpManagementDto>(`${this.base}/followups/management`, { params }).pipe(catchError(this.pipeError));
  }

  remindAll(semesterId: string): Observable<{ remindedCount: number }> {
    const params = new HttpParams().set('semesterId', semesterId);
    return this.http
      .post<{ remindedCount: number }>(`${this.base}/dashboard/follow-up-remind-all`, {}, { params })
      .pipe(catchError(this.pipeError));
  }

  dismissQueue(semesterId: string): Observable<{ dismissedCount: number }> {
    const params = new HttpParams().set('semesterId', semesterId);
    return this.http
      .post<{ dismissedCount: number }>(`${this.base}/dashboard/follow-up-dismiss-queue`, {}, { params })
      .pipe(catchError(this.pipeError));
  }

  markCompleted(id: string): Observable<FollowUpTaskDto> {
    return this.http.post<FollowUpTaskDto>(`${this.base}/followups/${id}/complete`, {}).pipe(catchError(this.pipeError));
  }

  listByStudent(studentProfileId: string): Observable<FollowUpTaskDto[]> {
    return this.http
      .get<FollowUpTaskDto[]>(`${this.base}/followups/student/${studentProfileId}`)
      .pipe(catchError(this.pipeError));
  }

  updateTask(id: string, body: UpdateFollowUpTaskPayload): Observable<FollowUpTaskDto> {
    return this.http.put<FollowUpTaskDto>(`${this.base}/followups/${id}`, body).pipe(catchError(this.pipeError));
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

export interface UpdateFollowUpTaskPayload {
  title: string;
  description: string | null;
  dueDate: string;
  status: number;
  priority: number;
  assignedTo: string;
  isDismissed: boolean;
}
