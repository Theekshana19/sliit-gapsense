/** Status shown on a recommendation card (e.g. Pending, Completed). */
export type RecommendationStatus = 'pending' | 'completed';

/** Resource type for a recommendation (icon mapping). */
export type ResourceTypeKey = 'description' | 'play_circle' | 'video_library' | 'article';

export interface RecommendationResourceInfo {
  icon: ResourceTypeKey;
  label: string;
}

export interface RecommendationAction {
  label: string;
}

/** High-priority recommendation card data. */
export interface HighPriorityRecommendation {
  id: string;
  topicLabel: string;
  title: string;
  description: string;
  resourceType: RecommendationResourceInfo;
  suggestedAction: RecommendationAction;
  status: RecommendationStatus;
  resourceUrl?: string;
  /** Optional decorative circle in corner (matches sample card 3). */
  decorativeCircle?: boolean;
}
