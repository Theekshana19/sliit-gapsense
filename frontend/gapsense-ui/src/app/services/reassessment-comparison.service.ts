import { computed, inject, Injectable, signal } from '@angular/core';
import { StudentAnalyticsApiService } from './student-analytics-api.service';
import type { ReassessmentComparisonViewModel } from '../models/risk-analysis/reassessment-comparison.model';

/** Empty shell when the API has not returned data yet (no fabricated scores). */
function emptyReassessmentView(): ReassessmentComparisonViewModel {
  const emptyScore = {
    label: 'Attempt',
    title: 'No attempts yet',
    sessionDate: '—',
    riskBadge: 'Moderate Risk' as const,
    scorePercent: 0,
    isHighRisk: true,
  };
  return {
    improvementDelta: {
      label: 'Improvement',
      message: 'Sign in and complete a quiz to see your comparison.',
    },
    attempt1Score: emptyScore,
    reassessmentScore: emptyScore,
    topicComparisons: [],
    topicBreakdown: [],
    observation: {
      label: 'Note',
      text: 'No reassessment data loaded yet.',
    },
    certificateAction: {
      title: 'Certificate',
      subtitle: 'Available after passing attempts.',
      buttonLabel: 'Download',
    },
  };
}

@Injectable({ providedIn: 'root' })
export class ReassessmentComparisonService {
  private readonly analyticsApi = inject(StudentAnalyticsApiService);
  private readonly _remote = signal<ReassessmentComparisonViewModel | null>(null);
  private readonly _certificateNotice = signal<string | null>(null);

  readonly certificateNotice = this._certificateNotice.asReadonly();

  readonly viewModel = computed((): ReassessmentComparisonViewModel =>
    this._remote() ?? emptyReassessmentView()
  );

  async tryLoadFromApi(): Promise<void> {
    const data = await this.analyticsApi.fetchReassessment();
    if (data) this._remote.set(data);
  }

  clearCertificateNotice(): void {
    this._certificateNotice.set(null);
  }

  requestGenerateCertificate(): void {
    const msg = 'Certificate generation will be available when the API is connected.';
    this._certificateNotice.set(msg);
    window.setTimeout(() => {
      if (this._certificateNotice() === msg) this._certificateNotice.set(null);
    }, 8000);
  }
}
