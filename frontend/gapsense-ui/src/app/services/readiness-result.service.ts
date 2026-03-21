import { computed, Injectable, signal } from '@angular/core';
import type { ReadinessResultViewModel } from '../models/risk-analysis/readiness-result.model';

const MOCK_READINESS_RESULT: ReadinessResultViewModel = {
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
  private readonly _data = signal<ReadinessResultViewModel | null>(null);
  private readonly _loading = signal(false);

  readonly data = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly hasData = computed(() => this._data() !== null);

  /** Load placeholder data (replace with API call later). */
  loadMock(): void {
    this._loading.set(true);
    // Simulate async boundary so UI can show loading if needed later
    queueMicrotask(() => {
      this._data.set(MOCK_READINESS_RESULT);
      this._loading.set(false);
    });
  }

  /** Wire to PDF generation / print when backend exists. */
  exportPdfPlaceholder(): void {
    console.info('[ReadinessResult] exportPdfPlaceholder — connect PDF pipeline here');
  }

  /** Wire to share dialog / deep link when backend exists. */
  shareReportPlaceholder(): void {
    console.info('[ReadinessResult] shareReportPlaceholder — connect share flow here');
  }
}
