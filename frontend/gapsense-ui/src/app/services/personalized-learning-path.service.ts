import { computed, inject, Injectable, signal } from '@angular/core';
import { StudentAnalyticsApiService } from './student-analytics-api.service';
import type { PersonalizedLearningPathViewModel } from '../models/risk-analysis/personalized-learning-path.model';

const MOCK_VIEW_MODEL: PersonalizedLearningPathViewModel = {
  summary: {
    label: 'Overall Readiness',
    readinessPercent: 33,
    nextMilestoneLabel: 'Next Milestone:',
    nextMilestoneName: 'Requirement Specialist',
    completedCount: 1,
    totalCount: 3,
    helperText: "You've completed 1 out of 3 major topic reviews. Keep going!",
  },
  resumeItem: {
    title: 'Resume Learning',
    topicName: 'Requirement Planning',
    continueLabel: 'Continue',
  },
  steps: [
    {
      id: 'step-1',
      stepNumber: 1,
      title: 'Step 1: Risk Analysis',
      status: 'completed',
      date: 'March 12, 2024',
      metadata: [
        { icon: 'quiz', label: 'Quiz 01 Review' },
        { icon: 'schedule', label: '45 mins' },
      ],
      actionLabel: 'View Performance Summary',
    },
    {
      id: 'step-2',
      stepNumber: 2,
      title: 'Step 2: Requirement Planning',
      status: 'in_progress',
      badgeLabel: 'Recommended Action',
      recommendationNote:
        'Based on your last mock exam, your score in Requirement gathering was below the 60% threshold. Watch this masterclass to improve.',
      resourcePanel: {
        icon: 'videocam',
        title: 'Requirement Masterclass 101',
        subtext: 'Video Tutorial • 24:12 remaining',
        actionLabel: 'Resume Video',
      },
    },
    {
      id: 'step-3',
      stepNumber: 3,
      title: 'Step 3: Normalization',
      status: 'locked',
      metadata: [
        { icon: 'description', label: 'Supplementary PDF' },
        { icon: 'assignment', label: '3 Practice Tasks' },
      ],
      unlockNote: 'Unlocks after completing Requirement Planning.',
    },
  ],
  footerActions: {
    title: 'Struggling with the path?',
    subtitle: 'Recalibrate your learning engine based on a new diagnostic test.',
    primaryButtonLabel: 'Retake Readiness Test',
    secondaryButtonLabel: 'Download PDF Path',
  },
};

/**
 * Mock personalized learning path service. Replace with HTTP + DTO mapping
 * when the backend is ready.
 */
@Injectable({ providedIn: 'root' })
export class PersonalizedLearningPathService {
  private readonly analyticsApi = inject(StudentAnalyticsApiService);
  private readonly _remote = signal<PersonalizedLearningPathViewModel | null>(null);

  private readonly _downloadPdfNotice = signal<string | null>(null);
  private readonly _retakeNotice = signal<string | null>(null);

  readonly downloadPdfNotice = this._downloadPdfNotice.asReadonly();
  readonly retakeNotice = this._retakeNotice.asReadonly();

  readonly viewModel = computed((): PersonalizedLearningPathViewModel =>
    this._remote() ?? MOCK_VIEW_MODEL
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
    // Placeholder: open summary modal/page
  }

  resumeResource(stepId: string): void {
    // Placeholder: resume video/resource
  }
}
