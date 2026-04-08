import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Row shape from GET /api/readiness-results (GapSense.API.Models.ApiResponse). */
export interface ReadinessResultListDto {
  id: string;
  studentName: string;
  studentId: string;
  moduleCode: string;
  semesterLabel: string;
  attemptLabel: string;
  analysisDateLabel: string;
  totalScorePercent: number;
  riskLevel: string;
  riskDescription: string;
  weakTopicsCount: number;
  weakTopicsSeverityLabel: string;
  weakTopicsHelperText: string;
  actionPlanRecommendationCount: number;
  actionPlanBadgeLabel: string;
  actionPlanHelperText: string;
  interpretationMessage: string;
  topicPerformance: { topicName: string; percent: number }[];
}

@Injectable({ providedIn: 'root' })
export class ReadinessReportingService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE_URL}/api/readiness-results`;

  listResults(): Observable<ReadinessResultListDto[]> {
    return this.http.get<ApiResponse<ReadinessResultListDto[]>>(this.base).pipe(
      map((r) => (r.success && r.data ? r.data : []))
    );
  }

  exportPdfBlob(id: string): Observable<Blob> {
    return this.http.get(`${this.base}/${encodeURIComponent(id)}/export-pdf`, {
      responseType: 'blob',
    });
  }
}
