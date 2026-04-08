import type { HighPriorityGroup } from './recommendation-priority-group.model';
import type { MediumPriorityGroup } from './recommendation-priority-group.model';
import type { RecommendationInsightView } from './recommendation-insight.model';
import type { RecommendationRoadmapView } from './recommendation-roadmap-item.model';

/** Full view model for the Personalized Recommendations page (mock or API-mapped). */
export interface PersonalizedRecommendationsViewModel {
  highPriority: HighPriorityGroup;
  mediumPriority: MediumPriorityGroup;
  insight: RecommendationInsightView;
  roadmap: RecommendationRoadmapView;
}
