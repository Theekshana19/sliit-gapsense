export type RecommendationRuleStatus = 'active' | 'inactive' | 'paused';

export const STATUS_LABELS: Record<RecommendationRuleStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  paused: 'Paused',
};
