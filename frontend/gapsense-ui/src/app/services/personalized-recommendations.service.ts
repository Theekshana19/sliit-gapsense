import { computed, Injectable, signal } from '@angular/core';
import type { HighPriorityRecommendation } from '../models/risk-analysis/personalized-recommendation.model';
import type { MediumPriorityRecommendation } from '../models/risk-analysis/recommendation-medium-card.model';
import type { RecommendationInsightView } from '../models/risk-analysis/recommendation-insight.model';
import type { RecommendationRoadmapView } from '../models/risk-analysis/recommendation-roadmap-item.model';
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

const MOCK_HIGH: HighPriorityRecommendation[] = [
  {
    id: 'rec-1',
    topicLabel: 'Risk Management',
    title: 'Mastering Risk Management Foundations',
    description:
      'A deep dive into quantitative risk analysis methods to bridge the gap identified in your last reassessment.',
    resourceType: { icon: 'description', label: 'Interactive PDF Guide' },
    suggestedAction: { label: 'Review Chapter 3 & Complete Quiz' },
    status: 'pending',
  },
  {
    id: 'rec-2',
    topicLabel: 'Systems Architecture',
    title: 'Distributed Systems Resilience',
    description:
      'Understanding fault tolerance and consistency models in modern cloud-native architectures.',
    resourceType: { icon: 'play_circle', label: 'Video Workshop (45 min)' },
    suggestedAction: { label: 'Watch Part 2: CAP Theorem' },
    status: 'completed',
  },
  {
    id: 'rec-3',
    topicLabel: 'Database Design',
    decorativeCircle: true,
    title: 'Indexing Strategies for Scale',
    description:
      'Optimization techniques for complex query structures in large-scale relational databases.',
    resourceType: { icon: 'description', label: 'Technical Whitepaper' },
    suggestedAction: { label: 'Apply B-Tree concepts to Lab 4' },
    status: 'pending',
  },
];

const MOCK_MEDIUM: MediumPriorityRecommendation[] = [
  {
    id: 'med-1',
    topicLabel: 'Web Security',
    title: 'OAuth 2.0 Flow Mastery',
    description:
      'Enhance your understanding of secure authentication flows and token management.',
    resourceTypeIcon: 'video_library',
    resourceTypeLabel: 'Video Course',
    imageUrl:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=320&h=200&fit=crop',
    imageAlt: 'Abstract code and data pattern for technical learning',
  },
  {
    id: 'med-2',
    topicLabel: 'Data Ethics',
    title: 'AI Governance Frameworks',
    description:
      'Reviewing global standards for ethical AI implementation in enterprise settings.',
    resourceTypeIcon: 'article',
    resourceTypeLabel: 'Journal Paper',
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=320&h=200&fit=crop',
    imageAlt: 'Analytic dashboard visualization for data science',
  },
];

const MOCK_INSIGHT: RecommendationInsightView = {
  badgeLabel: 'ENGINE INSIGHT',
  title: 'Why these recommendations?',
  explanation:
    'Our analysis indicates a 15% dip in "Conceptual Application" scores over the last 3 assessment cycles. The High Priority resources are specifically selected to target this gap by providing practical case studies rather than theoretical definitions.',
  metrics: [
    { value: '84%', label: 'Recommended Resource Match' },
    { value: '4.2h', label: 'Estimated Study Time' },
    { value: '+12%', label: 'Projected Mastery Growth' },
  ],
};

const MOCK_ROADMAP: RecommendationRoadmapView = {
  title: 'Progress Roadmap',
  items: [
    { stepNumber: 1, label: 'Complete Risk Management (High)', status: 'completed' },
    { stepNumber: 2, label: 'Take Diagnostic Quiz 2', status: 'pending' },
    { stepNumber: 3, label: 'Review Systems Architecture', status: 'pending' },
  ],
  updateButtonLabel: 'Update Roadmap',
};

/**
 * Mock personalized recommendations service. Replace mock data and
 * buildViewModel with HTTP + DTO mapping when the backend is ready.
 */
@Injectable({ providedIn: 'root' })
export class PersonalizedRecommendationsService {
  private readonly _filterNotice = signal<string | null>(null);
  private readonly _generateNotice = signal<string | null>(null);
  private readonly _roadmapNotice = signal<string | null>(null);

  readonly filterNotice = this._filterNotice.asReadonly();
  readonly generateNotice = this._generateNotice.asReadonly();
  readonly roadmapNotice = this._roadmapNotice.asReadonly();

  readonly viewModel = computed((): PersonalizedRecommendationsViewModel =>
    this.buildViewModel()
  );

  private buildViewModel(): PersonalizedRecommendationsViewModel {
    return {
      highPriority: {
        config: HIGH_PRIORITY_CONFIG,
        items: MOCK_HIGH,
      },
      mediumPriority: {
        config: MEDIUM_PRIORITY_CONFIG,
        items: MOCK_MEDIUM,
      },
      insight: MOCK_INSIGHT,
      roadmap: MOCK_ROADMAP,
    };
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
