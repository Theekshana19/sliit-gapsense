import { computed, inject, Injectable, signal } from '@angular/core';
import { StudentAnalyticsApiService } from './student-analytics-api.service';
import type { PersonalizedLearningPathViewModel } from '../models/risk-analysis/personalized-learning-path.model';

function emptyLearningPath(): PersonalizedLearningPathViewModel {
  return {
    summary: {
      label: 'Learning path',
      readinessPercent: 0,
      nextMilestoneLabel: 'Next milestone',
      nextMilestoneName: '—',
      completedCount: 0,
      totalCount: 0,
      helperText: 'Complete an assessment to generate your path from real data.',
    },
    resumeItem: {
      title: 'Get started',
      topicName: 'General',
      continueLabel: 'Continue',
    },
    steps: [
      {
        id: '1',
        stepNumber: 1,
        title: 'Take a diagnostic quiz',
        status: 'in_progress',
        recommendationNote: 'Your path will populate from assessment data.',
      },
    ],
    footerActions: {
      title: 'Need help?',
      subtitle: 'Contact your module coordinator for interventions.',
      primaryButtonLabel: 'Export summary',
      secondaryButtonLabel: 'Retake quiz',
    },
  };
}

@Injectable({ providedIn: 'root' })
export class PersonalizedLearningPathService {
  private readonly analyticsApi = inject(StudentAnalyticsApiService);
  private readonly _remote = signal<PersonalizedLearningPathViewModel | null>(null);

  private readonly _downloadPdfNotice = signal<string | null>(null);
  private readonly _retakeNotice = signal<string | null>(null);

  readonly downloadPdfNotice = this._downloadPdfNotice.asReadonly();
  readonly retakeNotice = this._retakeNotice.asReadonly();

  readonly viewModel = computed((): PersonalizedLearningPathViewModel =>
    this._remote() ?? emptyLearningPath()
  );

  async tryLoadFromApi(): Promise<void> {
    const data = await this.analyticsApi.fetchLearningPath();
    if (data) this._remote.set(data);
  }

  clearDownloadPdfNotice(): void {
    this._downloadPdfNotice.set(null);
  }

  clearRetakeNotice(): void {
    this._retakeNotice.set(null);
  }

  requestDownloadPdfPath(): void {
    const msg = 'PDF path download will be available when the API is connected.';
    this._downloadPdfNotice.set(msg);
    window.setTimeout(() => {
      if (this._downloadPdfNotice() === msg) this._downloadPdfNotice.set(null);
    }, 8000);
  }

  requestRetakeReadinessTest(): void {
    const msg = 'Retake readiness test will launch when the API is connected.';
    this._retakeNotice.set(msg);
    window.setTimeout(() => {
      if (this._retakeNotice() === msg) this._retakeNotice.set(null);
    }, 8000);
  }

  continueLearning(): void {
    // Placeholder: navigate to current resource
  }

  viewPerformanceSummary(stepId: string): void {
    void stepId;
  }

  resumeResource(stepId: string): void {
    void stepId;
  }
}
