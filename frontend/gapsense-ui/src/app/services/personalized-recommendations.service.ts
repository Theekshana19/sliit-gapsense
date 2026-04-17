import { computed, inject, Injectable, signal } from '@angular/core';
import { StudentAnalyticsApiService } from './student-analytics-api.service';
import type {
  HighPriorityGroup,
  MediumPriorityGroup,
  PrioritySectionConfig,
} from '../models/risk-analysis/recommendation-priority-group.model';
import type { PersonalizedRecommendationsViewModel } from '../models/risk-analysis/personalized-recommendations-view.model';

const HIGH_PRIORITY_CONFIG: PrioritySectionConfig = {
  title: 'High Priority',
  badgeLabel: 'CRITICAL FOCUS',
  badgeTone: 'error',
};

const MEDIUM_PRIORITY_CONFIG: PrioritySectionConfig = {
  title: 'Medium Priority',
  badgeLabel: 'ONGOING ENHANCEMENT',
  badgeTone: 'secondary',
};

function emptyRecommendations(): PersonalizedRecommendationsViewModel {
  const highPriority: HighPriorityGroup = {
    config: HIGH_PRIORITY_CONFIG,
    items: [],
  };
  const mediumPriority: MediumPriorityGroup = {
    config: MEDIUM_PRIORITY_CONFIG,
    items: [],
  };
  return {
    highPriority,
    mediumPriority,
    insight: {
      badgeLabel: 'Insights',
      title: 'Recommendation coverage',
      explanation:
        'Recommendations appear when your topic scores match active rules in the system.',
      metrics: [
        { value: '0', label: 'High priority' },
        { value: '0', label: 'Medium priority' },
        { value: '—', label: 'Active rules' },
      ],
    },
    roadmap: {
      title: 'Next steps',
      items: [{ stepNumber: 1, label: 'Take a diagnostic quiz', status: 'pending' }],
      updateButtonLabel: 'Refresh',
    },
  };
}

@Injectable({ providedIn: 'root' })
export class PersonalizedRecommendationsService {
  private readonly analyticsApi = inject(StudentAnalyticsApiService);
  private readonly _remote = signal<PersonalizedRecommendationsViewModel | null>(null);

  private readonly _filterNotice = signal<string | null>(null);
  private readonly _generateNotice = signal<string | null>(null);
  private readonly _roadmapNotice = signal<string | null>(null);

  readonly filterNotice = this._filterNotice.asReadonly();
  readonly generateNotice = this._generateNotice.asReadonly();
  readonly roadmapNotice = this._roadmapNotice.asReadonly();

  readonly viewModel = computed((): PersonalizedRecommendationsViewModel =>
    this._remote() ?? emptyRecommendations()
  );

  async tryLoadFromApi(): Promise<void> {
    const data = await this.analyticsApi.fetchRecommendations();
    if (data) this._remote.set(data);
  }

  clearFilterNotice(): void {
    this._filterNotice.set(null);
  }

  clearGenerateNotice(): void {
    this._generateNotice.set(null);
  }

  clearRoadmapNotice(): void {
    this._roadmapNotice.set(null);
  }

  /** Placeholder until filter API exists. */
  requestFilter(): void {
    const msg =
      'Filter options will be available when the recommendations API is connected.';
    this._filterNotice.set(msg);
    this.setNoticeTimeout(() => {
      if (this._filterNotice() === msg) this._filterNotice.set(null);
    });
  }

  /** Placeholder until regenerate API exists. */
  requestGenerateNew(): void {
    const msg =
      'Generate New will trigger a fresh recommendation run when the API is connected.';
    this._generateNotice.set(msg);
    this.setNoticeTimeout(() => {
      if (this._generateNotice() === msg) this._generateNotice.set(null);
    });
  }

  /** Placeholder until roadmap update API exists. */
  requestUpdateRoadmap(): void {
    const msg =
      'Roadmap update will sync with the recommendations API when connected.';
    this._roadmapNotice.set(msg);
    this.setNoticeTimeout(() => {
      if (this._roadmapNotice() === msg) this._roadmapNotice.set(null);
    });
  }

  private setNoticeTimeout(fn: () => void, ms = 8000): void {
    window.setTimeout(fn, ms);
  }
}
