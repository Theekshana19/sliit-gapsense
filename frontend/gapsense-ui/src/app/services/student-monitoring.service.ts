import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  CreateInterventionAssignmentPayload,
  CreateMeetingPayload,
  CreateMonitoringNotePayload,
  CreateReferralPayload,
  InterventionAssignmentDto,
  MonitoringNoteDto,
  MonitoringSummary,
  StudentMonitoringDetails,
  StudentProfileListItem,
  UpdateInterventionAssignmentPayload,
  UpdateMeetingPayload,
  UpdateReferralPayload,
} from '../models/student-monitoring/student-monitoring.model';

@Injectable({ providedIn: 'root' })
export class StudentMonitoringService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  getMonitoringSummary(): Observable<MonitoringSummary> {
    return this.http.get<MonitoringSummary>(`${this.base}/studentprofiles/monitoring-summary`).pipe(catchError(this.pipeError));
  }

  listStudentProfiles(): Observable<StudentProfileListItem[]> {
    return this.http.get<StudentProfileListItem[]>(`${this.base}/studentprofiles`).pipe(catchError(this.pipeError));
  }

  getStudentDetails(id: string): Observable<StudentMonitoringDetails> {
    return this.http.get<StudentMonitoringDetails>(`${this.base}/studentprofiles/${id}/details`).pipe(catchError(this.pipeError));
  }

  createIntervention(body: CreateInterventionAssignmentPayload): Observable<InterventionAssignmentDto> {
    return this.http.post<InterventionAssignmentDto>(`${this.base}/interventionassignments`, body).pipe(catchError(this.pipeError));
  }

  updateIntervention(id: string, body: UpdateInterventionAssignmentPayload): Observable<InterventionAssignmentDto> {
    return this.http.put<InterventionAssignmentDto>(`${this.base}/interventionassignments/${id}`, body).pipe(catchError(this.pipeError));
  }

  createNote(body: CreateMonitoringNotePayload): Observable<MonitoringNoteDto> {
    return this.http.post<MonitoringNoteDto>(`${this.base}/monitoringnotes`, body).pipe(catchError(this.pipeError));
  }

  createMeeting(body: CreateMeetingPayload) {
    return this.http.post(`${this.base}/meetings`, body).pipe(catchError(this.pipeError));
  }

  updateMeeting(id: string, body: UpdateMeetingPayload) {
    return this.http.put(`${this.base}/meetings/${id}`, body).pipe(catchError(this.pipeError));
  }

  createReferral(body: CreateReferralPayload) {
    return this.http.post(`${this.base}/referrals`, body).pipe(catchError(this.pipeError));
  }

  updateReferral(id: string, body: UpdateReferralPayload) {
    return this.http.put(`${this.base}/referrals/${id}`, body).pipe(catchError(this.pipeError));
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
    return throwError(() => new Error(err.message || 'Request failed'));
  }
}
