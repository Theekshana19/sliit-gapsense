import type { HighPriorityRecommendation } from './personalized-recommendation.model';
import type { MediumPriorityRecommendation } from './recommendation-medium-card.model';

export type PriorityLevel = 'high' | 'medium';

export interface PrioritySectionConfig {
  title: string;
  badgeLabel: string;
  badgeTone: 'error' | 'secondary';
}

export interface HighPriorityGroup {
  config: PrioritySectionConfig;
  items: HighPriorityRecommendation[];
}

export interface MediumPriorityGroup {
  config: PrioritySectionConfig;
  items: MediumPriorityRecommendation[];
}
