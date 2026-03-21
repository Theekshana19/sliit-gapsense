import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { READINESS_RESULT_EXPORT_ID } from '../models/risk-analysis/readiness-result.constants';
import type { ReadinessResultViewModel } from '../models/risk-analysis/readiness-result.model';

const MOCK_READINESS_RESULT: ReadinessResultViewModel = {
  id: READINESS_RESULT_EXPORT_ID,
  student: {
    studentName: 'Nimna Silva',
    studentId: 'IT21004562',
    initials: 'NS',
    moduleCode: 'IT3040',
    semesterLabel: 'Year 3, Semester 1',
    attemptLabel: '01',
    analysisDateLabel: 'Oct 24, 2023',
  },
  interpretation: {
    message:
      'Student requires additional preparation before starting this module.',
    tone: 'warning',
  },
  score: {
    percent: 42,
    barTone: 'error',
  },
  risk: {
    level: 'high',
    description: 'Significant gaps detected in fundamental concepts.',
  },
  weakTopics: {
    count: 3,
    severityLabel: 'High Severity',
    helperText: 'Critical foundations missing',
  },
  actionPlan: {
    recommendationCount: 5,
    badgeLabel: 'Key Recommendations',
    helperText: 'Targeted learning paths',
  },
  topicPerformance: [
    {
      topicName: 'Linear Algebra Basics',
      percent: 28,
      barVariant: 'critical',
    },
    {
      topicName: 'Discrete Mathematics',
      percent: 45,
      barVariant: 'neutral',
    },
    {
      topicName: 'Introduction to Programming',
      percent: 52,
      barVariant: 'neutral',
    },
  ],
};

/**
 * Provides readiness diagnostic data. Currently mock-only; swap `loadMock` / `_data`
 * for HTTP + DTO mapping when the backend is ready.
 */
@Injectable({ providedIn: 'root' })
export class ReadinessResultService {
  private readonly http = inject(HttpClient);

  private readonly _data = signal<ReadinessResultViewModel | null>(null);
  private readonly _loading = signal(false);
  private readonly _exportPdfLoading = signal(false);
  private readonly _exportError = signal<string | null>(null);

  readonly data = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly exportPdfLoading = this._exportPdfLoading.asReadonly();
  readonly exportError = this._exportError.asReadonly();

  readonly hasData = computed(() => this._data() !== null);

  private get exportPdfUrl(): string {
    return `${API_BASE_URL}/api/readiness-results`;
  }

  /** Load placeholder data (replace with API call later). */
  loadMock(): void {
    this._loading.set(true);
    // Simulate async boundary so UI can show loading if needed later
    queueMicrotask(() => {
      this._data.set(MOCK_READINESS_RESULT);
      this._loading.set(false);
    });
  }

  clearExportError(): void {
    this._exportError.set(null);
  }

  /**
   * Downloads PDF from GET /api/readiness-results/{id}/export-pdf.
   * Uses current view model id when present, otherwise the demo export id.
   */
  async exportPdf(): Promise<void> {
    const id = this._data()?.id ?? READINESS_RESULT_EXPORT_ID;
    this._exportPdfLoading.set(true);
    this._exportError.set(null);
    const url = `${this.exportPdfUrl}/${encodeURIComponent(id)}/export-pdf`;
    try {
      const blob = await firstValueFrom(
        this.http.get(url, { responseType: 'blob' })
      );
      if (!blob || blob.size === 0) {
        this._exportError.set('Empty PDF response from server.');
        return;
      }
      const fileName = `readiness-result-${id}.pdf`;
      this.triggerBlobDownload(blob, fileName);
    } catch (e) {
      this._exportError.set(this.messageFromExportError(e));
    } finally {
      this._exportPdfLoading.set(false);
    }
  }

  private messageFromExportError(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      if (e.status === 404) return 'Readiness report not found.';
      if (e.status === 0) return 'Network error. Is the API running?';
      if (e.error instanceof Blob) {
        return 'Could not export PDF. Please try again.';
      }
      return e.message || 'Could not export PDF.';
    }
    return 'Could not export PDF.';
  }

  private triggerBlobDownload(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /** Wire to share dialog / deep link when backend exists. */
  shareReportPlaceholder(): void {
    console.info('[ReadinessResult] shareReportPlaceholder — connect share flow here');
  }
}
